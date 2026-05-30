import { NextResponse } from 'next/server';
import { z } from 'zod';
import { pool } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

const reportCreateSchema = z.object({
  title: z.string().min(2).max(255),
  config: z.record(z.any()).default({}),
  is_public: z.boolean().default(false),
});

export async function GET(request: Request) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.current_org_id', $1, true)`, [orgId]);
      
      const dbRes = await client.query(
        `SELECT id, title, config, is_public, created_at, updated_at 
         FROM reports
         ORDER BY updated_at DESC`
      );

      await client.query('COMMIT');
      return NextResponse.json({ success: true, reports: dbRes.rows });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('List reports error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reportCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid configuration payload.' }, { status: 400 });
    }

    const { title, config, is_public } = parsed.data;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.current_org_id', $1, true)`, [orgId]);
      
      const dbRes = await client.query(
        `INSERT INTO reports (org_id, title, config, is_public)
         VALUES ($1, $2, $3, $4)
         RETURNING id, title, config, is_public, created_at, updated_at`,
        [orgId, title, JSON.stringify(config), is_public]
      );

      await client.query('COMMIT');
      return NextResponse.json({ success: true, report: dbRes.rows[0] }, { status: 210 });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}
