import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/google',
  '/auth/google/success',
  '/api-test',
  '/terms',
  '/privacy',
];

const PUBLIC_PREFIXES = [
  '/_next',
  '/favicon',
  '/api',
  '/static',
  '/icon',
  '/images',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/')) ||
    PUBLIC_PREFIXES.some(p => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // Check refreshToken cookie (works in same-domain / local dev)
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // In production (cross-domain), cookies won't be present
  // Let the client-side AuthProvider handle auth redirects instead
  // Only redirect if we're definitely not authenticated (no cookie)
  // and only in same-domain scenarios
  const host = request.headers.get('host') || '';
  const isLocalDev = host.includes('localhost');

  // Only enforce middleware auth check on localhost
  // In production, let client-side handle it (AuthProvider)
  if (isLocalDev && !refreshToken) {
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
