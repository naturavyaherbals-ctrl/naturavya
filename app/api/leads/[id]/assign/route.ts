// =====================================================
// LEAD ASSIGNMENT API
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id: leadId } = params;
    const body = await request.json();
    const { assigned_to } = body;

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Get current lead data
    const { data: currentLead } = await supabase
      .from('leads')
      .select('assigned_to, previous_assignees')
      .eq('id', leadId)
      .single();

    // Update previous assignees
    let previousAssignees = currentLead?.previous_assignees || [];
    if (currentLead?.assigned_to && !previousAssignees.includes(currentLead.assigned_to)) {
      previousAssignees.push(currentLead.assigned_to);
    }

    // Update lead assignment
    const { data, error } = await supabase
      .from('leads')
      .update({
        assigned_to,
        assigned_at: new Date().toISOString(),
        previous_assignees: previousAssignees,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select(`
        *,
        assigned_team_member:team_members(*, user:users(full_name))
      `)
      .single();

    if (error) throw error;

    // Create activity log
    await supabase
      .from('lead_activities')
      .insert({
        lead_id: leadId,
        activity_type: 'assignment',
        description: `Lead assigned to ${data.assigned_team_member?.user?.full_name || 'team member'}`,
        created_by: userId,
      });

    return NextResponse.json({
      success: true,
      data,
      message: 'Lead assigned successfully',
    });
  } catch (error: any) {
    console.error('Error assigning lead:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}