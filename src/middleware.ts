import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/lobby') {
    const token = request.cookies.get('sb-access-token') || 
                  request.cookies.get('sb-127.0.0.1-auth-token') || 
                  request.cookies.get('supabase-auth-token');

    if (!token) {
      console.log('[Middleware] No auth token, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/lobby', '/quiz', '/profile']
};