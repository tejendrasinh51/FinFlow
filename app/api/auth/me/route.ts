import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const orgId = request.headers.get('x-org-id');
    const userName = request.headers.get('x-user-name');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthenticated.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        role: userRole,
        orgId,
        name: userName,
      },
    });
  } catch (error) {
    console.error('Session profile query failed:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}
