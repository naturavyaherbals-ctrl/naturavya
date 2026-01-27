import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip middleware for static assets, images, and internal Next.js files
  // This prevents the middleware from running thousands of times unnecessarily
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // matches .png, .jpg, .ico, etc.
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 2. Use getSession() instead of getUser() for speed in Middleware
  const { data: { session } } = await supabase.auth.getSession();

  // 3. Logic for /admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      // Use absolute URL to prevent loop issues
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 4. Logic for /login route (redirect if already logged in)
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return response;
}

// 5. Very specific matcher to reduce invocation count
export const config = {
  matcher: ['/admin/:path*', '/login', '/account/:path*'],
};