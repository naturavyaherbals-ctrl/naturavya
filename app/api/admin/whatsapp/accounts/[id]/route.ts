export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Get single account
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('whatsapp_accounts')
      .select(`
        *,
        assigned_team_member:team_members!whatsapp_accounts_assigned_to_fkey(*, user:users(*))
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, account: data });
  } catch (error) {
    console.error('WhatsApp account fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch account' }, { status: 500 });
  }
}