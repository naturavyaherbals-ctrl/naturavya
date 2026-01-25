// =====================================================
// AGENT DASHBOARD STATS API
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

    // Get team member ID
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!teamMember) {
      return NextResponse.json({ success: false, error: 'Team member not found' }, { status: 404 });
    }

    const teamMemberId = teamMember.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Get first day of month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartISO = firstDayOfMonth.toISOString();

    // Execute queries in parallel
    const [
      { count: leadsAssignedToday },
      { count: leadsAssignedTotal },
      { count: leadsConvertedToday },
      { count: leadsConvertedTotal },
      { data: ordersData },
      { count: followUpPending },
    ] = await Promise.all([
      // Leads assigned today
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', teamMemberId)
        .gte('assigned_at', todayISO),
      
      // Leads assigned this month
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', teamMemberId)
        .gte('assigned_at', monthStartISO),
      
      // Leads converted today
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', teamMemberId)
        .eq('is_converted', true)
        .gte('converted_at', todayISO),
      
      // Leads converted this month
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', teamMemberId)
        .eq('is_converted', true)
        .gte('converted_at', monthStartISO),
      
      // Orders this month (for revenue)
      supabase
        .from('orders')
        .select('total, created_at')
        .eq('assigned_to', teamMemberId)
        .gte('created_at', monthStartISO)
        .in('status', ['confirmed', 'processing', 'shipped', 'delivered']),
      
      // Follow-ups pending
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', teamMemberId)
        .eq('status', 'follow_up'),
    ]);

    // Calculate revenue
    const revenueToday = ordersData
      ?.filter(o => new Date(o.created_at) >= today)
      .reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    
    const revenueTotal = ordersData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    // Calculate conversion rate
    const conversionRate = leadsAssignedTotal && leadsAssignedTotal > 0
      ? Math.round((leadsConvertedTotal || 0) / leadsAssignedTotal * 100)
      : 0;

    const stats = {
      leads_assigned_today: leadsAssignedToday || 0,
      leads_assigned_total: leadsAssignedTotal || 0,
      leads_converted_today: leadsConvertedToday || 0,
      leads_converted_total: leadsConvertedTotal || 0,
      orders_today: ordersData?.filter(o => new Date(o.created_at) >= today).length || 0,
      orders_total: ordersData?.length || 0,
      revenue_today: revenueToday,
      revenue_total: revenueTotal,
      conversion_rate: conversionRate,
      follow_up_pending: followUpPending || 0,
      avg_response_time: 0, // TODO: Calculate actual response time
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching agent stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
