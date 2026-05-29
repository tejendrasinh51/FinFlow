import { NextResponse } from 'next/server';
import { verifyJwt, createSession, isSessionActive, revokeSession } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const sessionCookie = request.headers.get('cookie')
      ?.split(';')
      .find(c => c.trim().startsWith('finflow-session='))
      ?.split('=')[1];

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Token missing.' }, { status: 401 });
    }

    const payload = verifyJwt(sessionCookie);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Token invalid or expired.' }, { status: 401 });
    }

    // Verify session state remains active in Redis
    const active = await isSessionActive(payload.userId, sessionCookie);
    if (!active) {
      return NextResponse.json({ success: false, error: 'Session has been revoked.' }, { status: 401 });
    }

    // Revoke old session and issue a refreshed one
    await revokeSession(payload.userId, sessionCookie);
    const newToken = await createSession(payload.userId, payload.orgId, payload.role, payload.name);

    const response = NextResponse.json({ success: true, user: payload });
    
    // Set cookie
    response.cookies.set('finflow-session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 604800, // 7 days in seconds
    });

    return response;
  } catch (error) {
    console.error('Refresh session error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
