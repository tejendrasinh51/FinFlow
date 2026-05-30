import { NextResponse } from 'next/server';
import { verifyJwt, revokeSession } from '@/lib/auth/session';
import { query } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const sessionToken = request.headers.get('cookie')
      ?.split(';')
      .find(c => c.trim().startsWith('finflow-session='))
      ?.split('=')[1];

    if (sessionToken) {
      const payload = verifyJwt(sessionToken);
      if (payload) {
        // Revoke state in Redis
        await revokeSession(payload.userId, sessionToken);
        
        // Write to audit log
        await query(
          `INSERT INTO audit_log (org_id, user_id, action, ip_address) VALUES ($1, $2, $3, $4)`,
          [payload.orgId, payload.userId, 'User signed out', request.headers.get('x-forwarded-for') || '127.0.0.1']
        );
      }
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
    
    // Invalidate the session cookie
    response.cookies.set('finflow-session', '', {
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Logout error encountered:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
