export const dynamic = 'force-dynamic'; // CRITICAL: Prevents the browser from caching a "logged out" state

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Use getUser() instead of getSession() for better security and reliability
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    // Get user details from your 'users' table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active, avatar_url')
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'User profile not found',
      }, { status: 404 });
    }

    // Verify Admin Roles
    const adminRoles = ['super_admin', 'admin', 'manager', 'agent'];
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Admin access required',
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Auth API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}