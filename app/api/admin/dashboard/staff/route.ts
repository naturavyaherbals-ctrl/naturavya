import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Map auth user → team member
    const { data: member } = await supabase
      .from('team_members')
      .select('id, role, name')
      .eq('user_id', user.id)
      .single();

    // If user is not mapped as team member, return zeros
    if (!member) {
      return NextResponse.json({
        success: true,
        data: {
          my_leads_total: 0,
          my_new_leads_today: 0,
          my_conversions_today: 0,
          my_revenue_today: 0,
          my_followups_due_today: 0,
          my_followups_overdue: 0,
          my_hot_leads: 0,
          my_warm_leads: 0,
          my_cold_leads: 0,
          my_calls_today: 0,
          my_completed_calls_today: 0,
          my_avg_call_duration_sec: 0,
          my_avg_response_time_min: 0,
        },
      });
    }

    const teamMemberId = member.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowISO = tomorrow.toISOString();

    const [
      // Leads totals
      { count: myLeadsTotal },
      { count: myNewLeadsToday },
      { count: myConversionsToday },

      // Revenue today from orders created by this agent
      { data: myRevenueOrdersToday },

      // Follow-ups
      { count: myFollowupsDueToday },
      { count: myFollowupsOverdue },

      // Temperatures
      { count: myHotLeads },
      { count: myWarmLeads },
      { count: myColdLeads },

      // Calls today
      { data: callsToday },

      // Response time
      { data: responseLeads },
    ] = await Promise.all([
      // All leads assigned to this agent
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', teamMemberId),

      // New leads today (assigned + created today)
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', teamMemberId)
        .gte('created_at', todayISO),

      // Conversions today
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', teamMemberId)
        .eq('is_converted', true)
        .gte('converted_at', todayISO),

      // Revenue today from orders created by this agent
      supabase
        .from('orders')
        .select('total')
        .eq('created_by_agent', teamMemberId)
        .gte('created_at', todayISO)
        .in('status', ['confirmed', 'processing', 'shipped', 'delivered']),

      // Follow-ups due today
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', teamMemberId)
        .eq('status', 'follow_up')
        .gte('next_follow_up_at', todayISO)
        .lt('next_follow_up_at', tomorrowISO),

      // Overdue follow-ups
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', teamMemberId)
        .eq('status', 'follow_up')
        .lt('next_follow_up_at', new Date().toISOString()),

      // Hot / warm / cold leads
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', teamMemberId)
        .eq('temperature', 'hot'),

      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', teamMemberId)
        .eq('temperature', 'warm'),

      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', teamMemberId)
        .eq('temperature', 'cold'),

      // Today's calls from lead_calls
      supabase
        .from('lead_calls')
        .select('status, duration_seconds')
        .eq('team_member_id', teamMemberId)
        .gte('started_at', todayISO),

      // Response time on leads
      supabase
        .from('leads')
        .select('response_time_minutes')
        .eq('assigned_to', teamMemberId)
        .not('response_time_minutes', 'is', null),
    ]);

    const myRevenueToday =
      myRevenueOrdersToday?.reduce(
        (sum: number, row: any) => sum + (row.total || 0),
        0
      ) || 0;

    // Call stats
    const totalCalls = callsToday?.length || 0;
    let completedCalls = 0;
    let totalDuration = 0;
    if (callsToday) {
      for (const c of callsToday) {
        if (c.status === 'completed') completedCalls++;
        if (typeof c.duration_seconds === 'number') {
          totalDuration += c.duration_seconds;
        }
      }
    }
    const avgCallDurationSec =
      totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

    // Avg response time (minutes)
    let avgResponseTimeMin = 0;
    if (responseLeads && responseLeads.length > 0) {
      const sum = responseLeads.reduce(
        (acc: number, row: any) => acc + (row.response_time_minutes || 0),
        0
      );
      avgResponseTimeMin = sum / responseLeads.length;
    }

    const data = {
      my_leads_total: myLeadsTotal || 0,
      my_new_leads_today: myNewLeadsToday || 0,
      my_conversions_today: myConversionsToday || 0,
      my_revenue_today: myRevenueToday,

      my_followups_due_today: myFollowupsDueToday || 0,
      my_followups_overdue: myFollowupsOverdue || 0,

      my_hot_leads: myHotLeads || 0,
      my_warm_leads: myWarmLeads || 0,
      my_cold_leads: myColdLeads || 0,

      my_calls_today: totalCalls,
      my_completed_calls_today: completedCalls,
      my_avg_call_duration_sec: avgCallDurationSec,
      my_avg_response_time_min: Number(avgResponseTimeMin.toFixed(1)),
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('staff dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}