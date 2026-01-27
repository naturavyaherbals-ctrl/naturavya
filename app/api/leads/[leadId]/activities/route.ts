// =====================================================
// LEAD ACTIVITIES API
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// =====================================================
// POST - CREATE ACTIVITY
// =====================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id: leadId } = params;
    const body = await request.json();

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const {
      activity_type,
      description,
      outcome,
      notes,
      scheduled_at,
    } = body;

    const { data, error } = await supabase
      .from('lead_activities')
      .insert({
        lead_id: leadId,
        activity_type,
        description,
        outcome,
        notes,
        scheduled_at,
        completed_at: !scheduled_at ? new Date().toISOString() : null,
        created_by: userId,
      })
      .select(`*, created_by_user:users(full_name)`)
      .single();

    if (error) throw error;

    // Update lead's last contacted timestamp
    await supabase
      .from('leads')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', leadId);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}