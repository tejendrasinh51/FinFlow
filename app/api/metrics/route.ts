import { NextResponse } from 'next/server';
import { z } from 'zod';
import { pool } from '@/lib/db/client';
import { getOrSetCache } from '@/lib/redis/cache';

export const dynamic = 'force-dynamic';

const metricsQuerySchema = z.object({
  types: z.string().transform((val) => val.split(',')).optional(),
  from: z.string().transform((val) => new Date(val)).optional(),
  to: z.string().transform((val) => new Date(val)).optional(),
  groupBy: z.enum(['day', 'month', 'year']).optional(),
});

export async function GET(request: Request) {
  try {
    // 1. Recover tenant context injected by middleware
    const orgId = request.headers.get('x-org-id');
    const userRole = request.headers.get('x-user-role');

    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Tenant context missing.' }, { status: 401 });
    }

    // 2. Parse request query parameters
    const url = new URL(request.url);
    const paramsObj = {
      types: url.searchParams.get('types') || undefined,
      from: url.searchParams.get('from') || undefined,
      to: url.searchParams.get('to') || undefined,
      groupBy: url.searchParams.get('groupBy') || undefined,
    };

    const parsed = metricsQuerySchema.safeParse(paramsObj);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid query filters provided.', details: parsed.error.format() }, { status: 400 });
    }

    const { types, from, to, groupBy } = parsed.data;

    // Standard fallback dates (last 12 months)
    const toDate = to || new Date();
    const fromDate = from || new Date(toDate.getFullYear() - 1, toDate.getMonth(), toDate.getDate());
    const filterTypes = types || ['mrr', 'arr', 'churn', 'dau', 'revenue', 'expense', 'profit'];

    // 3. Consult cache first (using getOrSetCache with TTL of 15 seconds)
    const cacheKey = `metrics:${orgId}:${filterTypes.join('-')}:${fromDate.toISOString()}:${toDate.toISOString()}:${groupBy || 'none'}`;

    const data = await getOrSetCache(cacheKey, 15, async () => {
      // Connect to DB and fetch enforcing row-level isolation
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Assert transaction organization scope for Postgres RLS
        await client.query(`SELECT set_config('app.current_org_id', $1, true)`, [orgId]);

        let queryText = `
          SELECT id, metric_type, value, recorded_at 
          FROM financial_metrics
          WHERE metric_type = ANY($1) AND recorded_at BETWEEN $2 AND $3
        `;

        const queryParams: any[] = [filterTypes, fromDate, toDate];

        if (groupBy === 'month') {
          queryText = `
            SELECT 
              metric_type, 
              SUM(value) as value, 
              DATE_TRUNC('month', recorded_at) as recorded_at
            FROM financial_metrics
            WHERE metric_type = ANY($1) AND recorded_at BETWEEN $2 AND $3
            GROUP BY metric_type, DATE_TRUNC('month', recorded_at)
            ORDER BY recorded_at ASC
          `;
        } else {
          queryText += ` ORDER BY recorded_at ASC`;
        }

        const dbRes = await client.query(queryText, queryParams);
        await client.query('COMMIT');
        
        return dbRes.rows;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    });

    return NextResponse.json({
      success: true,
      data,
      meta: {
        orgId,
        cached: true,
        revalidateIn: '15s',
      },
    });
  } catch (error: any) {
    console.error('Fetch metrics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while retrieving financial metrics.' },
      { status: 500 }
    );
  }
}
