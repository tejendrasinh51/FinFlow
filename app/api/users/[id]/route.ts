import { NextResponse } from 'next/server';
import { z } from 'zod';
import { pool } from '@/lib/db/client';

const userUpdateSchema = z.object({
  role: z.enum(['admin', 'analyst', 'viewer']).optional(),
  name: z.string().min(2).max(100).optional(),
  status: z.enum(['active', 'inactive', 'invited']).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orgId = request.headers.get('x-org-id');
    const userRole = request.headers.get('x-user-role');

    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    if (userRole !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid user parameters.' }, { status: 400 });
    }

    const updates = parsed.data;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No update parameters specified.' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.current_org_id', $1, true)`, [orgId]);

      // Dynamically build set parameters
      const setClauses: string[] = [];
      const queryValues: any[] = [orgId, id];
      let valueIdx = 3;

      if (updates.role !== undefined) {
        setClauses.push(`role = $${valueIdx++}`);
        queryValues.push(updates.role);
      }
      if (updates.name !== undefined) {
        setClauses.push(`name = $${valueIdx++}`);
        queryValues.push(updates.name);
      }
      if (updates.status !== undefined) {
        setClauses.push(`status = $${valueIdx++}`);
        queryValues.push(updates.status);
      }

      setClauses.push(`updated_at = NOW()`);

      const queryText = `
        UPDATE users
        SET ${setClauses.join(', ')}
        WHERE id = $2
        RETURNING id, email, role, name, status, created_at, updated_at
      `;

      const dbRes = await client.query(queryText, queryValues);
      await client.query('COMMIT');

      if (dbRes.rowCount === 0) {
        return NextResponse.json({ success: false, error: 'User not found in organization.' }, { status: 404 });
      }

      return NextResponse.json({ success: true, user: dbRes.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update user error:', error);
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

    if (userRole !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const { id } = params;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.current_org_id', $1, true)`, [orgId]);

      // Soft deactivate/deactivate of user
      const dbRes = await client.query(
        `UPDATE users
         SET status = 'inactive', updated_at = NOW()
         WHERE id = $2
         RETURNING id, email, role, name, status`,
        [orgId, id]
      );

      await client.query('COMMIT');

      if (dbRes.rowCount === 0) {
        return NextResponse.json({ success: false, error: 'User not found in organization.' }, { status: 404 });
      }

      return NextResponse.json({ success: true, user: dbRes.rows[0], message: 'User account deactivated.' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Deactivate user error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}
