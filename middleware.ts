import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl

  // 1. PUBLIC PATHS: Add paths that should NEVER redirect
  if (
    pathname === '/admin/login' || 
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') || 
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Use getUser() here too for consistency with the API
  const { data: { user } } = await supabase.auth.getUser()

  // 2. ADMIN PROTECTION
  if (pathname.startsWith('/admin') && !user) {
    // Break the loop: Ensure we don't redirect if we're already going to login
    return NextResponse.redirect(`${origin}/admin/login`)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'], // Only run on admin routes to be 100% safe
}