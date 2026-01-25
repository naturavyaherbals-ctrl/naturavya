import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Create response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Initialize Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 3. Get Session
  const { data: { user } } = await supabase.auth.getUser();

  // 4. PROTECT ADMIN ROUTES
  if (pathname.startsWith('/admin')) {
    
    // A. Allow access to the login page if NOT logged in
    if (pathname === '/admin/login') {
      if (user) {
        // If already logged in, go to dashboard instead of login page
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return response; // Show the login page
    }

    // B. If trying to access any other admin page and NOT logged in
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // C. Check for Admin Role (Optional but recommended)
    // If you want to strictly prevent customers from accessing /admin
    /*
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || !['super_admin', 'admin', 'manager', 'agent'].includes(userData.role)) {
       return NextResponse.redirect(new URL('/', request.url));
    }
    */
  }

  return response;
}

// 5. CONFIGURE MATCHER
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};