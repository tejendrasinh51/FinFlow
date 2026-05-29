import { NextResponse } from 'next/server';
import { verifyJwt, signJwt } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const sessionToken = request.cookies.get('finflow-session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const payload = verifyJwt(sessionToken);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid session.' }, { status: 401 });
    }

    // Generate a short-lived transient JWT specifically for WebSocket authentication (5-minute expiry)
    const wsToken = signJwt({
      userId: payload.userId,
      orgId: payload.orgId,
      role: payload.role,
      name: payload.name,
    });

    return NextResponse.json({ success: true, token: wsToken });
  } catch (error) {
    console.error('Handshake token error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}
