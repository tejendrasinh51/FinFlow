import { NextResponse } from 'next/server';
import { z } from 'zod';
import { pool } from '@/lib/db/client';
import { getOrSetCache } from '@/lib/redis/cache';

const singleMetricSchema = z.object({
  from: z.string().transform((val) => new Date(val)).optional(),
  to: z.string().transform((val) => new Date(val)).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Tenant context missing.' }, { status: 401 });
    }

    const { type } = params;
    const allowedTypes = ['mrr', 'arr', 'churn', 'dau', 'revenue', 'expense', 'profit'];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ success: false, error: `Invalid metric type requested: ${type}` }, { status: 400 });
    }

    // Parse queries
    const url = new URL(request.url);
    const fromStr = url.searchParams.get('from') || undefined;
    const toStr = url.searchParams.get('to') || undefined;

    const parsed = singleMetricSchema.safeParse({ from: fromStr, to: toStr });
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid range queries.' }, { status: 400 });
    }

    const toDate = parsed.data.to || new Date();
    const fromDate = parsed.data.from || new Date(toDate.getFullYear() - 1, toDate.getMonth(), toDate.getDate());

    const cacheKey = `metrics:${orgId}:type-${type}:${fromDate.toISOString()}:${toDate.toISOString()}`;

    const data = await getOrSetCache(cacheKey, 15, async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`SELECT set_config('app.current_org_id', $1, true)`, [orgId]);

        const dbRes = await client.query(
          `SELECT id, value, recorded_at 
           FROM financial_metrics
           WHERE metric_type = $1 AND recorded_at BETWEEN $2 AND $3
           ORDER BY recorded_at ASC`,
          [type, fromDate, toDate]
        );
        
        await client.query('COMMIT');
        return dbRes.rows;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    });

    return NextResponse.json({ success: true, type, data });
  } catch (error) {
    console.error(`Error loading metrics type ${params.type}:`, error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}
