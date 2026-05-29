import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Matcher paths to apply this middleware
export const config = {
  matcher: ['/dashboard/:path*', '/api/metrics/:path*', '/api/reports/:path*', '/api/users/:path*', '/api/export/:path*', '/api/auth/me'],
};

/**
 * Base64URL decode helper that is fully compatible with Edge Runtime
 */
function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Extract session token from cookie
  const sessionToken = request.cookies.get('finflow-session')?.value;

  if (!sessionToken) {
    // API routes return 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized. No active session found.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Page routes redirect to login page
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Decode and check expiration of the token
  const payload = decodeJwtPayload(sessionToken);

  if (!payload || !payload.exp || Date.now() >= payload.exp * 1000) {
    // Session token is invalid or expired
    const response = pathname.startsWith('/api/')
      ? new NextResponse(
          JSON.stringify({ success: false, error: 'Session expired. Please log in again.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      : NextResponse.redirect(new URL('/login', request.url));
      
    // Clear the expired cookie
    response.cookies.set('finflow-session', '', { path: '/', maxAge: 0 });
    return response;
  }

  // 3. Enforce Role-Based Access Control (RBAC) gates
  const userRole = payload.role;

  // Gate `/dashboard/users` and `/dashboard/settings` to admins only
  if (pathname.startsWith('/dashboard/users') || pathname.startsWith('/dashboard/settings')) {
    if (userRole !== 'admin') {
      const overviewUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(overviewUrl);
    }
  }

  // Gate admin APIs
  if (pathname.startsWith('/api/users') || pathname.startsWith('/api/settings')) {
    if (userRole !== 'admin') {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Forbidden. Admin privileges required.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 4. Set session values on header fields to inject user context into upstream handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId || '');
  requestHeaders.set('x-user-role', userRole || '');
  requestHeaders.set('x-org-id', payload.orgId || '');
  requestHeaders.set('x-user-name', payload.name || '');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
