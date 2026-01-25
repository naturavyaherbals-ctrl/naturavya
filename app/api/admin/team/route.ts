import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch team members
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Get team members with user details
    const { data: teamMembers, error } = await adminClient
      .from('team_members')
      .select(`
        *,
        user:users(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get stats for each team member
    const membersWithStats = await Promise.all(
      (teamMembers || []).map(async (member) => {
        // Get lead stats
        const { count: leadsAssigned } = await adminClient
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', member.id);

        const { count: leadsConverted } = await adminClient
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', member.id)
          .eq('status', 'order_confirmed');

        const { count: leadsContacted } = await adminClient
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', member.id)
          .gt('call_attempts', 0);

        // Get call stats
        const { count: totalCalls } = await adminClient
          .from('call_logs')
          .select('*', { count: 'exact', head: true })
          .eq('team_member_id', member.id);

        return {
          ...member,
          stats: {
            leadsAssigned: leadsAssigned || 0,
            leadsContacted: leadsContacted || 0,
            leadsConverted: leadsConverted || 0,
            conversionRate: leadsAssigned ? ((leadsConverted || 0) / leadsAssigned) * 100 : 0,
            totalCalls: totalCalls || 0,
          },
        };
      })
    );

    return NextResponse.json({ success: true, teamMembers: membersWithStats });
  } catch (error) {
    console.error('Team fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch team' }, { status: 500 });
  }
}

// POST - Create new team member
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify super_admin or admin role
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!currentUser || !['super_admin', 'admin'].includes(currentUser.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const adminClient = createAdminClient();

    // Validate required fields
    if (!body.email || !body.fullName || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Email, name, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await adminClient
      .from('users')
      .select('id')
      .eq('email', body.email)
      .single();

    let userId;

    if (existingUser) {
      userId = existingUser.id;
      
      // Update existing user role
      await adminClient
        .from('users')
        .update({ role: body.role })
        .eq('id', userId);
    } else {
      // Create new user
      const { data: newUser, error: userError } = await adminClient
        .from('users')
        .insert({
          email: body.email,
          full_name: body.fullName,
          phone: body.phone || null,
          role: body.role,
          is_active: true,
        })
        .select('*')
        .single();

      if (userError) throw userError;
      userId = newUser.id;

      // Create auth user (in a real app, send invite email)
      // For now, we'll use Supabase Auth Admin API
      try {
        const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
          email: body.email,
          password: body.tempPassword || 'TempPass123!',
          email_confirm: true,
          user_metadata: {
            full_name: body.fullName,
          },
        });

        if (authError) {
          console.error('Auth user creation error:', authError);
        } else if (authUser.user) {
          // Update the user ID to match auth user
          await adminClient
            .from('users')
            .update({ id: authUser.user.id })
            .eq('id', userId);
          userId = authUser.user.id;
        }
      } catch (authErr) {
        console.error('Auth creation error:', authErr);
        // Continue even if auth fails - user can be set up manually
      }
    }

    // Check if team member already exists
    const { data: existingMember } = await adminClient
      .from('team_members')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'Team member already exists' },
        { status: 400 }
      );
    }

    // Create team member
    const { data: teamMember, error: memberError } = await adminClient
      .from('team_members')
      .insert({
        user_id: userId,
        employee_id: body.employeeId || null,
        department: body.department || null,
        designation: body.designation || null,
        reporting_to: body.reportingTo || null,
        daily_lead_capacity: body.dailyLeadCapacity || 50,
        is_available: body.isAvailable !== false,
        shift_start: body.shiftStart || null,
        shift_end: body.shiftEnd || null,
      })
      .select(`*, user:users(*)`)
      .single();

    if (memberError) throw memberError;

    return NextResponse.json({ success: true, teamMember });
  } catch (error) {
    console.error('Team member creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create team member' }, { status: 500 });
  }
}