import { NextResponse } from 'next/server';
import { z } from 'zod';
import { pool } from '@/lib/db/client';

const reportUpdateSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  config: z.record(z.any()).optional(),
  is_public: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = params;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.current_org_id', $1, true)`, [orgId]);
      
      const dbRes = await client.query(
        `SELECT id, title, config, is_public, created_at, updated_at 
         FROM reports
         WHERE id = $2`,
        [orgId, id]
      );

      await client.query('COMMIT');

      if (dbRes.rowCount === 0) {
        return NextResponse.json({ success: false, error: 'Report not found.' }, { status: 404 });
      }

      return NextResponse.json({ success: true, report: dbRes.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Fetch single report error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const parsed = reportUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid update parameters.' }, { status: 400 });
    }

    const updates = parsed.data;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No update parameters specified.' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.current_org_id', $1, true)`, [orgId]);

      // Dynamically build the UPDATE fields
      const setClauses: string[] = [];
      const queryValues: any[] = [orgId, id];
      let valueIdx = 3;

      if (updates.title !== undefined) {
        setClauses.push(`title = $${valueIdx++}`);
        queryValues.push(updates.title);
      }
      if (updates.config !== undefined) {
        setClauses.push(`config = $${valueIdx++}`);
        queryValues.push(JSON.stringify(updates.config));
      }
      if (updates.is_public !== undefined) {
        setClauses.push(`is_public = $${valueIdx++}`);
        queryValues.push(updates.is_public);
      }

      setClauses.push(`updated_at = NOW()`);

      const queryText = `
        UPDATE reports
        SET ${setClauses.join(', ')}
        WHERE id = $2
        RETURNING id, title, config, is_public, created_at, updated_at
      `;

      const dbRes = await client.query(queryText, queryValues);
      await client.query('COMMIT');

      if (dbRes.rowCount === 0) {
        return NextResponse.json({ success: false, error: 'Report not found.' }, { status: 404 });
      }

      return NextResponse.json({ success: true, report: dbRes.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orgId = request.headers.get('x-org-id');
    const userRole = request.headers.get('x-user-role');

    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    // Gated: Admin only deletion
    if (userRole !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin role required to delete reports.' }, { status: 403 });
    }

    const { id } = params;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.current_org_id', $1, true)`, [orgId]);

      const dbRes = await client.query(
        `DELETE FROM reports
         WHERE id = $2`,
        [orgId, id]
      );

      await client.query('COMMIT');

      if (dbRes.rowCount === 0) {
        return NextResponse.json({ success: false, error: 'Report not found.' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Report deleted successfully.' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}
