// =====================================================
// MANAGER DASHBOARD STATS API
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get manager's team member ID
    const { data: manager } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!manager) {
      return NextResponse.json({ success: false, error: 'Manager not found' }, { status: 404 });
    }

    // Get team members reporting to this manager
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('id')
      .eq('reporting_to', manager.id);

    const teamMemberIds = teamMembers?.map(tm => tm.id) || [];
    teamMemberIds.push(manager.id); // Include manager themselves

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Execute queries in parallel for team stats
    const [
      { count: teamLeadsToday },
      { count: teamConversionsToday },
      { count: pendingFollowUps },
      { count: hotLeads },
      { count: pendingOrders },
      { data: revenueData },
    ] = await Promise.all([
      // Team leads today
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('assigned_to', teamMemberIds)
        .gte('created_at', todayISO),
      
      // Team conversions today
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('assigned_to', teamMemberIds)
        .eq('is_converted', true)
        .gte('converted_at', todayISO),
      
      // Pending follow-ups
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('assigned_to', teamMemberIds)
        .eq('status', 'follow_up'),
      
      // Hot leads
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('assigned_to', teamMemberIds)
        .eq('status', 'hot_lead'),
      
      // Pending orders
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('assigned_to', teamMemberIds)
        .eq('status', 'pending'),
      
      // Revenue today
      supabase
        .from('orders')
        .select('total')
        .in('assigned_to', teamMemberIds)
        .gte('created_at', todayISO)
        .in('status', ['confirmed', 'processing', 'shipped', 'delivered']),
    ]);

    const revenueToday = revenueData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    // Calculate conversion rate
    const conversionRate = teamLeadsToday && teamLeadsToday > 0
      ? Math.round((teamConversionsToday || 0) / teamLeadsToday * 100)
      : 0;

    const stats = {
      team_size: teamMemberIds.length,
      team_leads_today: teamLeadsToday || 0,
      team_conversions_today: teamConversionsToday || 0,
      pending_follow_ups: pendingFollowUps || 0,
      hot_leads: hotLeads || 0,
      pending_orders: pendingOrders || 0,
      revenue_today: revenueToday,
      conversion_rate: conversionRate,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching manager stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
