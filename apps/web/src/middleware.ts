import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/google',
  '/auth/google/success',
];

const PUBLIC_PREFIXES = [
  '/_next',
  '/favicon',
  '/api',
  '/static',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/')) ||
    PUBLIC_PREFIXES.some(p => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie (set by server on login/refresh)
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Also check Authorization header (for API routes)
  const authHeader = request.headers.get('authorization');

  // If no session indicator at all, redirect to login
  // We use refreshToken cookie as the auth indicator since
  // localStorage is not accessible in middleware
  if (!refreshToken && !authHeader) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.ico$).*)',
  ],
};
