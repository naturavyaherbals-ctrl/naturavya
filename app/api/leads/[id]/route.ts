// =====================================================
// SINGLE LEAD API - GET, UPDATE, DELETE
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// =====================================================
// GET - SINGLE LEAD
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = params;

    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        assigned_team_member:team_members(*, user:users(*)),
        activities:lead_activities(*, created_by_user:users(full_name)),
        status_history:lead_status_history(*, created_by_user:users(full_name)),
        converted_order:orders(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - UPDATE LEAD
// =====================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = params;
    const body = await request.json();

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Get current lead status
    const { data: currentLead } = await supabase
      .from('leads')
      .select('status, assigned_to')
      .eq('id', id)
      .single();

    // Update lead
    const updateData: any = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Handle status change
    if (body.status && body.status !== currentLead?.status) {
      updateData.last_contacted_at = new Date().toISOString();
      
      if (body.status === 'follow_up') {
        updateData.follow_up_count = (currentLead?.follow_up_count || 0) + 1;
      }
    }

    // Handle assignment
    if (body.assigned_to && body.assigned_to !== currentLead?.assigned_to) {
      updateData.assigned_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If status changed, create history entry
    if (body.status && body.status !== currentLead?.status) {
      await supabase
        .from('lead_status_history')
        .insert({
          lead_id: id,
          old_status: currentLead?.status,
          new_status: body.status,
          notes: body.status_notes,
          created_by: userId,
        });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}