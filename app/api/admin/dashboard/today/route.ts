import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Optional AI backend (local LLM or OpenAI)
const LLM_BASE_URL =
  process.env.LLM_BASE_URL || 'http://localhost:1234/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'naturavya-llm';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

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

    // App user + role
    const { data: appUser, error: userError } = await supabase
      .from('users')
      .select('id, role, full_name')
      .eq('id', user.id)
      .single();

    if (userError || !appUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 403 }
      );
    }

    const roleNorm = appUser.role
      ?.toLowerCase()
      .replace(/\s+/g, '_') as
      | 'super_admin'
      | 'admin'
      | 'manager'
      | 'agent'
      | string;

    // Time windows
    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const todayISO = startToday.toISOString();

    const start7 = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    );
    start7.setHours(0, 0, 0, 0);
    const start7ISO = start7.toISOString();
    const endISO = now.toISOString().slice(0, 10);

    // ========== STAFF VIEW (AGENT / MANAGER) ==========
    if (roleNorm === 'agent' || roleNorm === 'manager') {
      // Map auth user -> team member
      const { data: member } = await supabase
        .from('team_members')
        .select('id, role, name')
        .eq('user_id', user.id)
        .single();

      if (!member) {
        return NextResponse.json({
          success: true,
          data: {
            role: roleNorm,
            staffStats: null,
            adminSummary: null,
          },
        });
      }

      const teamMemberId = member.id;

      const [
        { count: myLeadsTotal },
        { count: myNewLeadsToday },
        { count: myConversionsToday },
        { data: myRevenueOrdersToday },
        { count: myFollowupsDueToday },
        { count: myFollowupsOverdue },
        { count: myHotLeads },
        { count: myWarmLeads },
        { count: myColdLeads },
        { data: callsToday },
        { data: responseLeads },
      ] = await Promise.all([
        // All leads for this agent
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', teamMemberId),

        // New leads today
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
          .in('status', [
            'confirmed',
            'processing',
            'shipped',
            'delivered',
          ]),

        // Follow-ups due today
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', teamMemberId)
          .eq('status', 'follow_up')
          .gte('next_follow_up_at', todayISO)
          .lt(
            'next_follow_up_at',
            new Date(
              startToday.getTime() + 24 * 60 * 60 * 1000
            ).toISOString()
          ),

        // Overdue follow-ups
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', teamMemberId)
          .eq('status', 'follow_up')
          .lt('next_follow_up_at', now.toISOString()),

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

        // Calls today
        supabase
          .from('lead_calls')
          .select('status, duration_seconds')
          .eq('team_member_id', teamMemberId)
          .gte('started_at', todayISO),

        // Response time metrics
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
        totalCalls > 0
          ? Math.round(totalDuration / totalCalls)
          : 0;

      let avgResponseTimeMin = 0;
      if (responseLeads && responseLeads.length > 0) {
        const sum = responseLeads.reduce(
          (acc: number, row: any) =>
            acc + (row.response_time_minutes || 0),
          0
        );
        avgResponseTimeMin = sum / responseLeads.length;
      }

      const staffStats = {
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
        my_avg_response_time_min: Number(
          avgResponseTimeMin.toFixed(1)
        ),
      };

      return NextResponse.json({
        success: true,
        data: {
          role: roleNorm,
          staffStats,
          adminSummary: null,
        },
      });
    }

    // ========== ADMIN / SUPER_ADMIN VIEW ==========
    // Last 7 days team performance + ads + RTO + AI suggestions

    // 1) Orders by agent (last 7 days)
    const { data: teamOrders, error: teamErr } = await supabase
      .from('orders')
      .select(
        `
        id,
        total,
        is_rto,
        created_at,
        created_by_agent,
        agent:team_members(id, name)
      `
      )
      .gte('created_at', start7ISO);

    if (teamErr) {
      console.error('teamOrders error:', teamErr);
    }

    const agentsMap = new Map<
      string,
      {
        agent_id: string;
        agent_name: string;
        orders: number;
        revenue: number;
        rto_orders: number;
      }
    >();

    let companyOrders = 0;
    let companyRevenue = 0;
    let companyRtoOrders = 0;

    if (teamOrders) {
      for (const o of teamOrders) {
        const agentId = o.created_by_agent || 'unknown';
        const agentName =
          o.agent?.name || (agentId === 'unknown' ? 'Unknown' : 'Agent');

        const revenue = Number(o.total || 0);
        const isRto = !!o.is_rto;

        companyOrders += 1;
        companyRevenue += revenue;
        if (isRto) companyRtoOrders += 1;

        if (!agentsMap.has(agentId)) {
          agentsMap.set(agentId, {
            agent_id: agentId,
            agent_name: agentName,
            orders: 0,
            revenue: 0,
            rto_orders: 0,
          });
        }
        const rec = agentsMap.get(agentId)!;
        rec.orders += 1;
        rec.revenue += revenue;
        if (isRto) rec.rto_orders += 1;
      }
    }

    const teamPerformance = Array.from(agentsMap.values())
      .map((a) => ({
        ...a,
        rto_rate_pct:
          a.orders > 0 ? (a.rto_orders / a.orders) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const companyRtoRate =
      companyOrders > 0
        ? (companyRtoOrders / companyOrders) * 100
        : 0;

    // 2) Ads performance (last 7 days) from lead_ads_performance_v
    const {
      data: adsRows,
      error: adsErr,
    } = await supabase
      .from('lead_ads_performance_v')
      .select('*')
      .gte('day', start7ISO.slice(0, 10))
      .lte('day', endISO);

    if (adsErr) console.error('adsRows error:', adsErr);

    const adsTotals = (adsRows || []).reduce(
      (acc: any, row: any) => {
        acc.leads += row.leads_count || 0;
        acc.converted_leads += row.converted_leads_count || 0;
        acc.orders += row.orders_count || 0;
        acc.revenue_total += Number(row.revenue_total || 0);
        return acc;
      },
      {
        leads: 0,
        converted_leads: 0,
        orders: 0,
        revenue_total: 0,
      }
    );

    const adsConversionRate =
      adsTotals.leads > 0
        ? (adsTotals.orders / adsTotals.leads) * 100
        : 0;

    // 3) RTO by agent (last 30 days) using helper function
    const start30 = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000
    );
    const start30Date = start30.toISOString().slice(0, 10);
    const endDate = now.toISOString().slice(0, 10);

    const {
      data: rtoAgents,
      error: rtoErr,
    } = await supabase.rpc('get_rto_stats_by_agent', {
      p_start_date: start30Date,
      p_end_date: endDate,
      p_limit: 100,
    });

    if (rtoErr) console.error('rtoAgents error:', rtoErr);

    const rtoTotals = (rtoAgents || []).reduce(
      (acc: any, row: any) => {
        acc.total_orders += row.total_orders || 0;
        acc.rto_orders += row.rto_orders || 0;
        acc.total_value += Number(row.total_value || 0);
        acc.rto_value += Number(row.rto_value || 0);
        return acc;
      },
      {
        total_orders: 0,
        rto_orders: 0,
        total_value: 0,
        rto_value: 0,
      }
    );

    const rtoRateCompany =
      rtoTotals.total_orders > 0
        ? (rtoTotals.rto_orders / rtoTotals.total_orders) * 100
        : 0;

    // 4) AI suggestion (optional)
    let aiSuggestion: string | null = null;
    try {
      const summaryPayload = {
        company: {
          orders_last7: companyOrders,
          revenue_last7: companyRevenue,
          rto_orders_last7: companyRtoOrders,
          rto_rate_last7: companyRtoRate,
        },
        team_top_agents: teamPerformance.slice(0, 3),
        ads_totals: {
          leads: adsTotals.leads,
          orders: adsTotals.orders,
          revenue: adsTotals.revenue_total,
          conv_rate: adsConversionRate,
        },
        rto_last30: {
          total_orders: rtoTotals.total_orders,
          rto_orders: rtoTotals.rto_orders,
          rto_rate: rtoRateCompany,
        },
      };

      const systemPrompt = `
You are a Naturavya (Ayurvedic D2C) growth coach.
Look at sales, RTO and ads metrics and give 3-5 concrete, Hinglish (Roman script) action points for today for the management team.

Focus on:
- Which agents or patterns need coaching (high RTO, low revenue)
- What to do with ads (scale / pause / change offer) based on leads & orders
- 1-2 clear RTO control actions (pincode / courier / process)
Keep bullets short and practical.
      `.trim();

      const userPrompt = `
Here is the JSON summary for the last days:

${JSON.stringify(summaryPayload, null, 2)}

Return ONLY plain text bullets (no JSON).
      `.trim();

      if (LLM_BASE_URL && LLM_MODEL) {
        const res = await fetch(
          `${LLM_BASE_URL}/chat/completions`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: LLM_MODEL,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.6,
            }),
          }
        );

        if (res.ok) {
          const json: any = await res.json();
          aiSuggestion =
            json.choices?.[0]?.message?.content || null;
        }
      } else if (OPENAI_API_KEY) {
        const res = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-4.1-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.6,
            }),
          }
        );

        if (res.ok) {
          const json: any = await res.json();
          aiSuggestion =
            json.choices?.[0]?.message?.content || null;
        }
      }
    } catch (e) {
      console.error('AI suggestion error (today dashboard):', e);
    }

    const adminSummary = {
      company: {
        orders_last7: companyOrders,
        revenue_last7: companyRevenue,
        rto_orders_last7: companyRtoOrders,
        rto_rate_last7: companyRtoRate,
      },
      team_top_agents: teamPerformance,
      ads_totals: {
        leads: adsTotals.leads,
        orders: adsTotals.orders,
        revenue: adsTotals.revenue_total,
        conv_rate: adsConversionRate,
      },
      rto_last30: {
        total_orders: rtoTotals.total_orders,
        rto_orders: rtoTotals.rto_orders,
        rto_rate: rtoRateCompany,
      },
      ai_suggestion: aiSuggestion,
    };

    return NextResponse.json({
      success: true,
      data: {
        role: roleNorm,
        staffStats: null,
        adminSummary,
      },
    });
  } catch (err: any) {
    console.error('GET /api/admin/dashboard/today error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}