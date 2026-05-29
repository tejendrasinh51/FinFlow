import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, transaction } from '@/lib/db/client';
import { createSession } from '@/lib/auth/session';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Demo accounts metadata
const DEMO_ACCOUNTS = [
  { email: 'admin@finflow.io',   password: 'Admin123!',   role: 'admin' as const,   name: 'Alex Kim' },
  { email: 'analyst@finflow.io', password: 'Analyst123!', role: 'analyst' as const, name: 'Sarah Chen' },
  { email: 'viewer@finflow.io',  password: 'Viewer123!',  role: 'viewer' as const,  name: 'James Park' },
];

/**
 * Automatically seeds demo accounts if they do not exist in the database
 */
async function ensureDemoAccountsSeeded() {
  try {
    // Check if organisations exist
    const orgCheck = await query('SELECT id FROM organisations LIMIT 1');
    if (orgCheck.rowCount > 0) return; // Seeding already occurred

    console.log('Database empty. Performing automatic seed of demo tenant and accounts...');
    
    await transaction(async (client) => {
      // 1. Create default organization
      const orgResult = await client.query(
        `INSERT INTO organisations (name, plan) VALUES ($1, $2) RETURNING id`,
        ['FinFlow Analytics Corp', 'enterprise']
      );
      const orgId = orgResult.rows[0].id;

      // 2. Hash and seed each account
      for (const account of DEMO_ACCOUNTS) {
        const hashedPassword = await bcrypt.hash(account.password, 12);
        await client.query(
          `INSERT INTO users (org_id, email, password_hash, role, name, status) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [orgId, account.email, hashedPassword, account.role, account.name, 'active']
        );
      }

      // 3. Seed some default metrics to display on the dashboard
      const now = new Date();
      const metricTypes = ['mrr', 'arr', 'churn', 'dau', 'revenue', 'expense', 'profit'];
      
      // Let's seed 12 months of revenue, expenses, and profits
      for (let i = 11; i >= 0; i--) {
        const recordedDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const revenue = 800000 + Math.random() * 400000;
        const expense = 500000 + Math.random() * 200000;
        const profit = revenue - expense;

        await client.query(
          `INSERT INTO financial_metrics (org_id, metric_type, value, recorded_at) VALUES ($1, $2, $3, $4)`,
          [orgId, 'revenue', revenue, recordedDate]
        );
        await client.query(
          `INSERT INTO financial_metrics (org_id, metric_type, value, recorded_at) VALUES ($1, $2, $3, $4)`,
          [orgId, 'expense', expense, recordedDate]
        );
        await client.query(
          `INSERT INTO financial_metrics (org_id, metric_type, value, recorded_at) VALUES ($1, $2, $3, $4)`,
          [orgId, 'profit', profit, recordedDate]
        );
      }

      // Seed core status metrics
      await client.query(
        `INSERT INTO financial_metrics (org_id, metric_type, value, recorded_at) VALUES ($1, $2, $3, $4)`,
        [orgId, 'mrr', 1240000, now]
      );
      await client.query(
        `INSERT INTO financial_metrics (org_id, metric_type, value, recorded_at) VALUES ($1, $2, $3, $4)`,
        [orgId, 'arr', 14880000, now]
      );
      await client.query(
        `INSERT INTO financial_metrics (org_id, metric_type, value, recorded_at) VALUES ($1, $2, $3, $4)`,
        [orgId, 'churn', 2.1, now]
      );
      await client.query(
        `INSERT INTO financial_metrics (org_id, metric_type, value, recorded_at) VALUES ($1, $2, $3, $4)`,
        [orgId, 'dau', 10247, now]
      );

      console.log('Seeding completed successfully.');
    });
  } catch (error) {
    console.error('Failed to auto-seed demo database records:', error);
  }
}

export async function POST(request: Request) {
  try {
    // 1. Ensure demo accounts exist
    await ensureDemoAccountsSeeded();

    // 2. Parse request payload
    const body = await request.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid login details. Format constraints not met.' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // 3. Query user by email from database
    const userQuery = await query(
      `SELECT u.id, u.org_id, u.email, u.password_hash, u.role, u.name, u.status, o.name as org_name
       FROM users u
       JOIN organisations o ON u.org_id = o.id
       WHERE u.email = $1 AND u.status = 'active'`,
      [email]
    );

    if (userQuery.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = userQuery.rows[0];

    // 4. Validate bcrypt password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 5. Establish valid Redis session and generate verified JWT
    const token = await createSession(user.id, user.org_id, user.role, user.name);

    // 6. Write login audit log entry
    await query(
      `INSERT INTO audit_log (org_id, user_id, action, ip_address) VALUES ($1, $2, $3, $4)`,
      [user.org_id, user.id, 'User sign-in succeeded', request.headers.get('x-forwarded-for') || '127.0.0.1']
    );

    // 7. Setup session HttpOnly Cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        orgId: user.org_id,
        orgName: user.org_name,
      },
    });

    response.cookies.set('finflow-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 604800, // 7 days in seconds
    });

    return response;
  } catch (error: any) {
    console.error('Auth login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
