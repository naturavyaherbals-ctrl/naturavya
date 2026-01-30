export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

let tokenCache: string | null = null;

// Helper to get Shiprocket Token
async function getShiprocketToken() {
  if (tokenCache) return tokenCache;

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  const data = await res.json();
  if (data.token) {
    tokenCache = data.token;
    return data.token;
  }
  throw new Error('Failed to auth with Shiprocket');
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Role Check
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint'); // e.g. 'orders', 'shipments'

    const token = await getShiprocketToken();
    let url = 'https://apiv2.shiprocket.in/v1/external';

    // Map internal endpoints to Shiprocket API
    if (endpoint === 'dashboard') {
      // Mocking a dashboard stats response (Shiprocket doesn't have a single 'stats' endpoint like this)
      // We fetch recent orders to calculate basic stats
      url += '/orders?page=1&per_page=50';
    } else if (endpoint === 'orders') {
      url += '/orders';
    } else if (endpoint === 'shipments') {
      url += '/shipments';
    } else {
      return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Shiprocket API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}