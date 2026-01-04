import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 1. Only protect /admin routes
  if (path.startsWith('/admin')) {
    
    // 2. Always allow the login page (Prevents the loop!)
    if (path === '/admin/login') {
      return NextResponse.next()
    }

    // 3. Check for the specific cookie your login page sets ("admin-auth")
    const isAdmin = request.cookies.get('admin-auth')?.value === 'true'

    // 4. If cookie is missing, send them to login
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

// Apply this to all admin pages
export const config = {
  matcher: ['/admin/:path*'],
}