import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ leadId: string }> } // Next.js 15 style
) {
  try {
    // 1. Await the params (Required in Next.js 15)
    const params = await props.params;
    const { leadId } = params;

    console.log('📡 Fetching lead details for ID:', leadId);

    const adminClient = createAdminClient();

    // 2. Fetch from Supabase
    const { data: lead, error } = await adminClient
      .from('leads')
      .select(`
        *,
        assigned_team_member:team_members(id, name, email)
      `)
      .eq('id', leadId)
      .single();

    // 3. Handle specific errors
    if (error) {
      console.error('❌ Supabase error fetching lead:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, lead });

  } catch (error: any) {
    console.error('❌ API Error in leads/[leadId]:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}