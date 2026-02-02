import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/lobby', '/quiz', '/profile'];
  
  if (protectedRoutes.includes(pathname)) {
    // ✅ Supabase PKCE flow cookie pattern
    // Cookie format: sb-<PROJECT_REF>-auth-token
    const cookies = request.cookies.getAll();
    
    const authToken = cookies.find(cookie => 
      cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
    );

    if (!authToken || !authToken.value) {
      console.log(`[Middleware] No auth token on ${pathname}, redirecting to /`);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/lobby', '/quiz', '/profile']
};
