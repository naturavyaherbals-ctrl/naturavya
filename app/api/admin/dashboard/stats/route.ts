// =====================================================
// ADMIN DASHBOARD STATS API
// =====================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Execute all queries in parallel
    const [
      // Today's stats
      { count: ordersToday },
      { data: revenueTodayData },
      { count: leadsToday },
      { count: newLeadsToday },
      
      // Total stats
      { count: ordersTotal },
      { data: revenueTotalData },
      { count: leadsTotal },
      { count: customersTotal },
      
      // Pending items
      { count: pendingOrders },
      { count: pendingFollowUps },
      { count: hotLeads },
      
      // Conversions
      { count: conversionsToday },
    ] = await Promise.all([
      // Today's orders
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO),
      
      // Today's revenue
      supabase
        .from('orders')
        .select('total')
        .gte('created_at', todayISO)
        .in('status', ['confirmed', 'processing', 'shipped', 'delivered']),
      
      // Today's leads
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO),
      
      // New leads today (status = new)
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO)
        .eq('status', 'new'),
      
      // Total orders
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true }),
      
      // Total revenue
      supabase
        .from('orders')
        .select('total')
        .eq('status', 'delivered'),
      
      // Total leads
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true }),
      
      // Total customers
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true }),
      
      // Pending orders
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      
      // Pending follow-ups
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'follow_up')
        .lte('next_follow_up_at', new Date().toISOString()),
      
      // Hot leads
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'hot_lead'),
      
      // Conversions today
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'converted')
        .gte('converted_at', todayISO),
    ]);

    // Calculate totals
    const revenueToday = revenueTodayData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const revenueTotal = revenueTotalData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    
    // Calculate conversion rate
    const conversionRate = leadsTotal && leadsTotal > 0
      ? Math.round((conversionsToday || 0) / (leadsToday || 1) * 100)
      : 0;
    
    // Calculate average order value
    const avgOrderValue = ordersTotal && ordersTotal > 0
      ? Math.round(revenueTotal / ordersTotal)
      : 0;

    const stats = {
      // Today
      leads_today: leadsToday || 0,
      leads_new_today: newLeadsToday || 0,
      orders_today: ordersToday || 0,
      revenue_today: revenueToday,
      conversions_today: conversionsToday || 0,
      
      // Total
      leads_total: leadsTotal || 0,
      orders_total: ordersTotal || 0,
      revenue_total: revenueTotal,
      customers_total: customersTotal || 0,
      
      // Pending
      pending_orders: pendingOrders || 0,
      pending_follow_ups: pendingFollowUps || 0,
      hot_leads: hotLeads || 0,
      
      // Performance
      conversion_rate: conversionRate,
      avg_order_value: avgOrderValue,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
