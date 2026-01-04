import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 1. Only protect /admin paths
  if (path.startsWith('/admin')) {
    
    // 2. IMPORTANT: Allow the login page to load (Stops the loop!)
    if (path === '/admin/login') {
      return NextResponse.next()
    }

    // 3. Check for the cookie your login page sets ("admin-auth")
    const isAdmin = request.cookies.get('admin-auth')?.value === 'true'

    // 4. If not logged in, redirect to login
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

// Apply this to all admin routes
export const config = {
  matcher: ['/admin/:path*'],
}