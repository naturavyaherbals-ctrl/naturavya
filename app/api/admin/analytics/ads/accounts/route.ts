export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Get ad accounts
export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('ad_accounts')
      .select('*')
      .order('platform')
      .order('account_name');

    if (error) throw error;

    return NextResponse.json({ success: true, accounts: data });
  } catch (error) {
    console.error('Ad accounts fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch ad accounts' }, { status: 500 });
  }
}

// POST - Add ad account
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify super_admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Only super admins can add ad accounts' }, { status: 403 });
    }

    const body = await request.json();
    const adminClient = createAdminClient();

    if (!body.platform || !body.accountId) {
      return NextResponse.json(
        { success: false, error: 'Platform and account ID are required' },
        { status: 400 }
      );
    }

    const { data: account, error } = await adminClient
      .from('ad_accounts')
      .insert({
        platform: body.platform,
        account_id: body.accountId,
        account_name: body.accountName || null,
        access_token: body.accessToken || null,
        refresh_token: body.refreshToken || null,
        token_expires_at: body.tokenExpiresAt || null,
        is_active: body.isActive !== false,
        sync_enabled: body.syncEnabled !== false,
        config: body.config || null,
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error('Ad account creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create ad account' }, { status: 500 });
  }
}