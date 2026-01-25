import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch WhatsApp accounts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: accounts, error } = await adminClient
      .from('whatsapp_accounts')
      .select(`
        *,
        assigned_team_member:team_members!whatsapp_accounts_assigned_to_fkey(*, user:users(*))
      `)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Hide sensitive tokens in response
    const sanitizedAccounts = accounts?.map(acc => ({
      ...acc,
      access_token: acc.access_token ? '***configured***' : null,
    }));

    return NextResponse.json({ success: true, accounts: sanitizedAccounts });
  } catch (error) {
    console.error('WhatsApp accounts fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch accounts' }, { status: 500 });
  }
}