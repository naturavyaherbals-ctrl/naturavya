// =====================================================
// MIDDLEWARE - TEMPORARILY PERMISSIVE FOR DEBUGGING
// =====================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log for debugging
  console.log('Middleware hit:', pathname);

  // For now, allow all admin routes without auth check
  // We'll add auth back after confirming routes work
  if (pathname.startsWith('/admin')) {
    console.log('Admin route accessed:', pathname);
    // Just pass through - no redirect
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};