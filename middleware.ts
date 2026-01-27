import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Initial Response
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // 2. Initialize Supabase
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
          response.cookies.set({ name, value, ...options });
        },
      },
    }
  );

  // 3. Check Session
  const { data: { session } } = await supabase.auth.getSession();

  // -----------------------------------------------------------------
  // 4. PROTECT ADMIN ROUTES (/admin/*)
  // -----------------------------------------------------------------
  if (pathname.startsWith('/admin')) {
    if (!session) {
      // Redirect unauthenticated users to the MAIN login page
      const loginUrl = new URL('/login', request.url); 
      return NextResponse.redirect(loginUrl);
    }
  }

  // -----------------------------------------------------------------
  // 5. REDIRECT IF ALREADY LOGGED IN
  // -----------------------------------------------------------------
  if (pathname === '/login' && session) {
    // If logged in, send them to dashboard
    // NOTE: Ideally check role here, but for now send to admin dashboard
    // The dashboard itself can redirect to /account if not an admin
    const dashboardUrl = new URL('/admin/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  // Apply to admin routes and main login page
  matcher: ['/admin/:path*', '/login'],
};