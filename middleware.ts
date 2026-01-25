import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. THE ABSOLUTE BYPASS
  // If the user is already on the login page, STOP EVERYTHING.
  // This physically prevents a loop.
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 2. OTHER EXEMPTIONS
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // 3. INITIALIZE SUPABASE
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

  // 4. CHECK SESSION
  const { data: { session } } = await supabase.auth.getSession();

  // 5. PROTECTION LOGIC
  if (pathname.startsWith('/admin') && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = ''; // Clear search params to avoid loop state
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};