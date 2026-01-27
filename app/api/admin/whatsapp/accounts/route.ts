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

    // 1. Attempt query with explicit relationship
    let { data: accounts, error } = await adminClient
      .from('whatsapp_accounts')
      .select(`
        *,
        assigned_team_member:team_members!whatsapp_accounts_assigned_to_fkey(*)
      `) // 👈 Removed ", user:users(*)"
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    // 2. Fallback if explicit relationship name is wrong/changed
    if (error && error.code === 'PGRST200') {
        console.warn("Retrying fetch accounts with simple join...");
        const retry = await adminClient
          .from('whatsapp_accounts')
          .select(`
            *,
            assigned_team_member:team_members(*)
          `)
          .order('is_primary', { ascending: false });
          
        if (!retry.error) {
            accounts = retry.data;
            error = null;
        } else {
            // Last resort: fetch accounts only
            const finalRetry = await adminClient
                .from('whatsapp_accounts')
                .select('*');
            accounts = finalRetry.data;
            error = null; 
        }
    }

    if (error) throw error;

    // Hide sensitive tokens in response
    const sanitizedAccounts = accounts?.map(acc => ({
      ...acc,
      access_token: acc.access_token ? '***configured***' : null,
    }));

    return NextResponse.json({ success: true, accounts: sanitizedAccounts });
  } catch (error: any) {
    console.error('WhatsApp accounts fetch error:', error);
    return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch accounts',
        details: error.message 
    }, { status: 500 });
  }
}