import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET: Fetch all team members
export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    
    const { data: teamMembers, error } = await adminClient
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ teamMembers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Add new member
export async function POST(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const body = await request.json();

    const name = body.name || body.fullName;
    const email = body.email;
    const password = body.password; 

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, Email, and Password are required' }, { status: 400 });
    }

    // 1. Create User in Supabase Auth
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: name, role: body.role || 'agent' }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Create Record in Team Members Table
    const { data: newMember, error: dbError } = await adminClient
      .from('team_members')
      .insert({
        user_id: authUser.user.id,
        name: name,
        email: email,
        phone: body.phone,
        role: body.role || 'agent',
        department: body.department,
        daily_lead_capacity: parseInt(body.dailyLeadCapacity || body.daily_lead_capacity || 50),
        is_active: body.isActive ?? true
      })
      .select()
      .single();

    if (dbError) {
      await adminClient.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, teamMember: newMember });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update member (With Fix for Missing Auth Link)
export async function PATCH(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const body = await request.json();

    if (!body.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    // 1. Get current member details to check linkage
    const { data: currentMember, error: fetchError } = await adminClient
      .from('team_members')
      .select('*')
      .eq('id', body.id)
      .single();

    if (fetchError || !currentMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // 2. Handle Password Update Logic
    if (body.password && body.password.trim() !== '') {
      
      if (currentMember.user_id) {
        // CASE A: User is linked correctly. Update password.
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
          currentMember.user_id,
          { password: body.password }
        );
        if (updateError) {
          console.error("Failed to update password in Auth:", updateError);
          return NextResponse.json({ error: "Failed to update password: " + updateError.message }, { status: 500 });
        }
      } else {
        // CASE B: User exists in DB but NOT in Auth (Broken Link). 
        // We must create the Auth user now and link it.
        console.log("Member missing Auth link. Creating new Auth user...");
        
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: currentMember.email, // Use email from DB
          password: body.password,
          email_confirm: true,
          user_metadata: { full_name: currentMember.name, role: currentMember.role }
        });

        if (createError) {
          // If email already taken but link is missing, try to find the user by email
          if (createError.message.includes("already been registered")) {
             // Try to find user by email to re-link
             // Note: listUsers is expensive, but necessary for recovery
             const { data: users } = await adminClient.auth.admin.listUsers();
             const existingUser = users.users.find(u => u.email === currentMember.email);
             
             if (existingUser) {
               // Update the existing user's password
               await adminClient.auth.admin.updateUserById(existingUser.id, { password: body.password });
               // Fix the link in DB
               await adminClient.from('team_members').update({ user_id: existingUser.id }).eq('id', body.id);
             } else {
               return NextResponse.json({ error: "Email exists but cannot be recovered. Delete and recreate user." }, { status: 400 });
             }
          } else {
            return NextResponse.json({ error: createError.message }, { status: 500 });
          }
        } else if (newUser.user) {
          // Successfully created new auth user, now link it
          const { error: linkError } = await adminClient
            .from('team_members')
            .update({ user_id: newUser.user.id })
            .eq('id', body.id);
            
          if (linkError) throw linkError;
        }
      }
    }

    // 3. Update Other Public Data
    const updateData: any = { updated_at: new Date().toISOString() };
    if (body.name || body.fullName) updateData.name = body.name || body.fullName;
    // Note: Changing email in DB doesn't change it in Auth automatically in this simple flow.
    // Ideally block email changes or handle separate sync logic.
    if (body.email) updateData.email = body.email; 
    if (body.phone) updateData.phone = body.phone;
    if (body.role) updateData.role = body.role;
    if (body.department) updateData.department = body.department;
    if (body.dailyLeadCapacity) updateData.daily_lead_capacity = parseInt(body.dailyLeadCapacity);
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    const { data: updatedMember, error: updateDbError } = await adminClient
      .from('team_members')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (updateDbError) throw updateDbError;

    return NextResponse.json({ success: true, teamMember: updatedMember });
  } catch (error: any) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove member
export async function DELETE(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { data: member } = await adminClient
      .from('team_members')
      .select('user_id')
      .eq('id', id)
      .single();

    if (member?.user_id) {
      await adminClient.auth.admin.deleteUser(member.user_id);
    }

    const { error } = await adminClient
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}