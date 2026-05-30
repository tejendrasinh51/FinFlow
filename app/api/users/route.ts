import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

const userInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'analyst', 'viewer']),
  name: z.string().min(2).max(100),
});

export async function GET(request: Request) {
  try {
    const orgId = request.headers.get('x-org-id');
    const userRole = request.headers.get('x-user-role');

    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    if (userRole !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin credentials required.' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.current_org_id', $1, true)`, [orgId]);
      
      const dbRes = await client.query(
        `SELECT id, email, role, name, status, created_at, updated_at 
         FROM users
         ORDER BY name ASC`
      );

      await client.query('COMMIT');
      return NextResponse.json({ success: true, users: dbRes.rows });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = request.headers.get('x-org-id');
    const userRole = request.headers.get('x-user-role');

    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    if (userRole !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin credentials required.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = userInviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid user parameters.' }, { status: 400 });
    }

    const { email, role, name } = parsed.data;

    // Generate random default password to store in case they don't complete onboarding
    const defaultPassword = 'User' + Math.random().toString(36).slice(-8) + '!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.current_org_id', $1, true)`, [orgId]);

      // Check if user already exists
      const checkRes = await client.query(`SELECT id FROM users WHERE email = $1`, [email]);
      if (checkRes.rowCount > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ success: false, error: 'A user with this email address already exists.' }, { status: 409 });
      }
      
      const dbRes = await client.query(
        `INSERT INTO users (org_id, email, password_hash, role, name, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, role, name, status, created_at`,
        [orgId, email, hashedPassword, role, name, 'invited']
      );

      await client.query('COMMIT');
      return NextResponse.json({
        success: true,
        user: dbRes.rows[0],
        message: 'Invitation extended successfully.',
        // For development output standard invite key credentials
        _devInvitePassword: defaultPassword
      }, { status: 210 });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Invite user error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}
