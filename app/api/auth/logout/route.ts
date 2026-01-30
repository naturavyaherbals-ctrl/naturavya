export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  
  // Sign out from Supabase
  await supabase.auth.signOut();

  // Redirect to home or login page
  const url = new URL('/', request.url);
  return NextResponse.redirect(url, {
    status: 302,
  });
}

// Also handle POST for buttons that use form actions
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  const url = new URL('/admin/login', request.url);
  return NextResponse.redirect(url, {
    status: 302,
  });
}
