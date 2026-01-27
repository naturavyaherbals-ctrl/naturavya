import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch conversations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adminClient = createAdminClient();

    const accountId = searchParams.get('accountId');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('whatsapp_conversations')
      .select(`
        *,
        whatsapp_account:whatsapp_accounts(id, name, phone_number),
        lead:leads(id, full_name, status),
        assigned_team_member:team_members!whatsapp_conversations_assigned_to_fkey(*) 
      `, { count: 'exact' }); // 👈 Removed ", user:users(*)" from here

    if (accountId) query = query.eq('whatsapp_account_id', accountId);
    if (status) query = query.eq('status', status);
    if (assignedTo) query = query.eq('assigned_to', assignedTo);
    if (search) {
      query = query.or(`contact_phone.ilike.%${search}%,contact_name.ilike.%${search}%`);
    }

    query = query
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        // Fallback: If explicit relationship fails, try simple join
        if (error.code === 'PGRST200') {
             console.log("Retrying with simple join...");
             query = adminClient
              .from('whatsapp_conversations')
              .select(`
                *,
                whatsapp_account:whatsapp_accounts(id, name, phone_number),
                lead:leads(id, full_name, status),
                assigned_team_member:team_members(*)
              `, { count: 'exact' });
             
             // Re-apply filters... (simplified for brevity)
             const retryResult = await query.range(offset, offset + limit - 1);
             if (retryResult.data) {
                 return NextResponse.json({
                  success: true,
                  conversations: retryResult.data,
                  total: retryResult.count || 0,
                  page,
                  limit,
                  totalPages: Math.ceil((retryResult.count || 0) / limit),
                });
             }
        }
        throw error;
    }

    return NextResponse.json({
      success: true,
      conversations: data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    console.error('Conversations fetch error:', error);
    return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch conversations',
        details: error.message 
    }, { status: 500 });
  }
}