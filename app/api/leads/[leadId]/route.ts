import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await props.params;
    
    // 1. Get the current logged-in user
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch the Team Member profile to check Role and ID
    const { data: member } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    const adminClient = createAdminClient();

    // 3. Start Lead Query
    let query = adminClient
      .from('leads')
      .select(`
        *,
        assigned_team_member:team_members(id, name, email)
      `)
      .eq('id', leadId);

    // 4. 🛡️ DATA ISOLATION LOGIC
    const role = member?.role?.toLowerCase().replace(' ', '_');

    if (role === 'agent') {
      // If the user is an agent, strictly filter the query so they can 
      // ONLY find the lead if it is assigned to their team member ID.
      query = query.eq('assigned_to', member.id);
    }
    // Admins and Super Admins bypass this and see the lead regardless of assignment.

    const { data: lead, error } = await query.single();

    // 5. Handle Errors or "Not Found"
    if (error) {
      if (error.code === 'PGRST116') {
        // If an agent tries to access a lead not assigned to them, 
        // the query returns no rows, resulting in a 404 (Not Found).
        return NextResponse.json({ error: 'Lead not found or access denied' }, { status: 404 });
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

// 🚀 ALSO UPDATING PATCH TO ENFORCE SAME SECURITY
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await props.params;
    const body = await request.json();
    
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get current user role
    const { data: member } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('user_id', user?.id)
      .single();

    const adminClient = createAdminClient();
    const role = member?.role?.toLowerCase().replace(' ', '_');

    // 🛡️ SECURITY CHECK: If agent, ensure they own the lead before updating
    if (role === 'agent') {
      const { data: existing } = await adminClient
        .from('leads')
        .select('assigned_to')
        .eq('id', leadId)
        .single();
      
      if (!existing || existing.assigned_to !== member.id) {
        return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
      }
    }

    // Proceed with update
    const { data: updatedLead, error } = await adminClient
      .from('leads')
      .update({
        full_name: body.full_name,
        phone: body.phone,
        email: body.email,
        status: body.status,
        priority: body.priority,
        notes: body.notes,
        assigned_to: (role === 'super_admin' || role === 'admin') ? body.assigned_to : undefined, // Only admins can re-assign
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}