import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 1. Only run this logic for Admin pages
  if (path.startsWith('/admin')) {
    
    // 2. Allow access to the Login page (Stop the loop!)
    if (path === '/admin/login') {
      return NextResponse.next()
    }

    // 3. Check if user has a Supabase session cookie
    // (Supabase cookies usually start with "sb-" and end with "-auth-token")
    const hasSession = request.cookies.getAll().some(
      (cookie) => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
    )

    // 4. If no session, kick them to login
    if (!hasSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

// Ensure this runs on admin routes
export const config = {
  matcher: ['/admin/:path*'],
}
