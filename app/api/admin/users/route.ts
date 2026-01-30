// =====================================================
// USERS MANAGEMENT API
// =====================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// =====================================================
// GET - LIST USERS
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const withoutTeam = searchParams.get('without_team') === 'true';
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    // If we need users without team member records
    if (withoutTeam && users) {
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('user_id');

      const teamUserIds = new Set(teamMembers?.map(tm => tm.user_id) || []);
      const filteredUsers = users.filter(user => !teamUserIds.has(user.id));

      return NextResponse.json({
        success: true,
        data: filteredUsers,
      });
    }

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - CREATE USER
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, full_name, password, role, phone } = body;

    // Validate required fields
    if (!email || !full_name || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, full name, and password are required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    });

    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      );
    }

    // Create user record in our users table
    const { data: user, error: userError } = await adminClient
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        phone,
        role: role || 'agent',
        is_active: true,
        email_verified: true,
      })
      .select()
      .single();

    if (userError) {
      // Rollback - delete auth user if user record creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User created successfully',
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}