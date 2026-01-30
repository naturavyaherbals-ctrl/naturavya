// =====================================================
// LOGIN API
// =====================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required',
      }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({
        success: false,
        error: authError.message,
      }, { status: 401 });
    }

    if (!authData.user) {
      return NextResponse.json({
        success: false,
        error: 'Login failed',
      }, { status: 401 });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active')
      .eq('id', authData.user.id)
      .single();

    if (userError || !user) {
      // User doesn't exist in our users table - create them
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.user_metadata?.full_name || email.split('@')[0],
          role: 'agent', // Default role
          is_active: true,
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to create user profile',
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        user: newUser,
      });
    }

    // Check if user has admin access
    const adminRoles = ['super_admin', 'admin', 'manager', 'agent'];
    if (!adminRoles.includes(user.role)) {
      await supabase.auth.signOut();
      return NextResponse.json({
        success: false,
        error: 'You do not have admin access',
      }, { status: 403 });
    }

    // Check if user is active
    if (!user.is_active) {
      await supabase.auth.signOut();
      return NextResponse.json({
        success: false,
        error: 'Your account is disabled',
      }, { status: 403 });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
