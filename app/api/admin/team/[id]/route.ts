import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Get single team member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('team_members')
      .select(`*, user:users(*)`)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, teamMember: data });
  } catch (error) {
    console.error('Team member fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch team member' }, { status: 500 });
  }
}

// PUT - Update team member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const adminClient = createAdminClient();

    // Update team member
    const updateData: Record<string, any> = {};
    
    if (body.employeeId !== undefined) updateData.employee_id = body.employeeId;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.designation !== undefined) updateData.designation = body.designation;
    if (body.reportingTo !== undefined) updateData.reporting_to = body.reportingTo;
    if (body.dailyLeadCapacity !== undefined) updateData.daily_lead_capacity = body.dailyLeadCapacity;
    if (body.isAvailable !== undefined) updateData.is_available = body.isAvailable;
    if (body.shiftStart !== undefined) updateData.shift_start = body.shiftStart;
    if (body.shiftEnd !== undefined) updateData.shift_end = body.shiftEnd;

    const { data, error } = await adminClient
      .from('team_members')
      .update(updateData)
      .eq('id', params.id)
      .select(`*, user:users(*)`)
      .single();

    if (error) throw error;

    // Update user details if provided
    if (body.fullName || body.phone || body.role) {
      const userUpdate: Record<string, any> = {};
      if (body.fullName) userUpdate.full_name = body.fullName;
      if (body.phone) userUpdate.phone = body.phone;
      if (body.role) userUpdate.role = body.role;
      if (body.isActive !== undefined) userUpdate.is_active = body.isActive;

      await adminClient
        .from('users')
        .update(userUpdate)
        .eq('id', data.user_id);
    }

    return NextResponse.json({ success: true, teamMember: data });
  } catch (error) {
    console.error('Team member update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update team member' }, { status: 500 });
  }
}

// DELETE - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Get team member to get user_id
    const { data: member } = await adminClient
      .from('team_members')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (!member) {
      return NextResponse.json({ success: false, error: 'Team member not found' }, { status: 404 });
    }

    // Reassign leads to unassigned
    await adminClient
      .from('leads')
      .update({ assigned_to: null, assigned_at: null })
      .eq('assigned_to', params.id);

    // Delete team member
    const { error } = await adminClient
      .from('team_members')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    // Deactivate user (don't delete)
    await adminClient
      .from('users')
      .update({ is_active: false, role: 'customer' })
      .eq('id', member.user_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Team member delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete team member' }, { status: 500 });
  }
}