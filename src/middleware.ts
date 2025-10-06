import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth';

const publicRoutes = ['/login', '/register'];
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Redirect from GCP default domain to custom domain
  const customDomain = process.env.NEXT_PUBLIC_CUSTOM_DOMAIN;
  if (customDomain && hostname.includes('run.app') && !hostname.includes(customDomain)) {
    const customUrl = new URL(request.url);
    customUrl.host = customDomain;
    customUrl.protocol = 'https:';
    return NextResponse.redirect(customUrl, 301); // 301 = permanent redirect
  }

  // Check if user is authenticated
  const session = await verifySession(request);
  const isAuthenticated = !!session;

  // Redirect to login if trying to access protected route without authentication
  if (!publicRoutes.includes(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if authenticated user tries to access auth routes
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth/* (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
