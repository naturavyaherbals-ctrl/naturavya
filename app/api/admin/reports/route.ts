// =====================================================
// REPORTS API
// =====================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    const reportType = searchParams.get('type') || 'overview';
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // Build date filter
    const dateFilter = startDate && endDate
      ? { start: startDate, end: endDate }
      : null;

    let reportData: any = {};

    switch (reportType) {
      case 'overview':
        reportData = await getOverviewReport(supabase, dateFilter);
        break;
      case 'leads':
        reportData = await getLeadsReport(supabase, dateFilter);
        break;
      case 'sales':
        reportData = await getSalesReport(supabase, dateFilter);
        break;
      case 'team':
        reportData = await getTeamReport(supabase, dateFilter);
        break;
      default:
        reportData = await getOverviewReport(supabase, dateFilter);
    }

    return NextResponse.json({
      success: true,
      data: reportData,
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =====================================================
// REPORT GENERATORS
// =====================================================

async function getOverviewReport(supabase: any, dateFilter: any) {
  let ordersQuery = supabase.from('orders').select('total, status');
  let leadsQuery = supabase.from('leads').select('status, is_converted');

  if (dateFilter) {
    ordersQuery = ordersQuery.gte('created_at', dateFilter.start).lte('created_at', dateFilter.end);
    leadsQuery = leadsQuery.gte('created_at', dateFilter.start).lte('created_at', dateFilter.end);
  }

  const [{ data: orders }, { data: leads }] = await Promise.all([
    ordersQuery,
    leadsQuery,
  ]);

  const revenue = orders
    ?.filter((o: any) => ['confirmed', 'processing', 'shipped', 'delivered'].includes(o.status))
    .reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0;

  const totalLeads = leads?.length || 0;
  const convertedLeads = leads?.filter((l: any) => l.is_converted).length || 0;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  return {
    revenue,
    orders: orders?.length || 0,
    leads: totalLeads,
    conversionRate,
    revenueChange: 0, // TODO: Calculate from previous period
    ordersChange: 0,
    leadsChange: 0,
    conversionChange: 0,
  };
}

async function getLeadsReport(supabase: any, dateFilter: any) {
  let query = supabase.from('leads').select('status, source');

  if (dateFilter) {
    query = query.gte('created_at', dateFilter.start).lte('created_at', dateFilter.end);
  }

  const { data: leads } = await query;

  // Status breakdown
  const statusBreakdown: Record<string, number> = {};
  const sourceBreakdown: Record<string, number> = {};

  leads?.forEach((lead: any) => {
    statusBreakdown[lead.status] = (statusBreakdown[lead.status] || 0) + 1;
    sourceBreakdown[lead.source] = (sourceBreakdown[lead.source] || 0) + 1;
  });

  return {
    totalLeads: leads?.length || 0,
    statusBreakdown,
    sourceBreakdown,
  };
}

async function getSalesReport(supabase: any, dateFilter: any) {
  let query = supabase.from('orders').select(`
    total,
    status,
    payment_method,
    items:order_items(product_id, name, quantity, total_price)
  `).in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

  if (dateFilter) {
    query = query.gte('created_at', dateFilter.start).lte('created_at', dateFilter.end);
  }

  const { data: orders } = await query;

  const totalSales = orders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0;
  const totalOrders = orders?.length || 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const codOrders = orders?.filter((o: any) => o.payment_method === 'cod').length || 0;

  // Top products
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  
  orders?.forEach((order: any) => {
    order.items?.forEach((item: any) => {
      const key = item.product_id || item.name;
      if (!productSales[key]) {
        productSales[key] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productSales[key].quantity += item.quantity;
      productSales[key].revenue += item.total_price;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    totalSales,
    totalOrders,
    avgOrderValue,
    codOrders,
    topProducts,
  };
}

async function getTeamReport(supabase: any, dateFilter: any) {
  // Get all team members
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select(`
      id,
      user:users(full_name)
    `);

  if (!teamMembers) {
    return { teamPerformance: [] };
  }

  // Get performance for each team member
  const teamPerformance = await Promise.all(
    teamMembers.map(async (member: any) => {
      let leadsQuery = supabase
        .from('leads')
        .select('status, is_converted')
        .eq('assigned_to', member.id);

      let ordersQuery = supabase
        .from('orders')
        .select('total')
        .eq('assigned_to', member.id)
        .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

      if (dateFilter) {
        leadsQuery = leadsQuery.gte('assigned_at', dateFilter.start).lte('assigned_at', dateFilter.end);
        ordersQuery = ordersQuery.gte('created_at', dateFilter.start).lte('created_at', dateFilter.end);
      }

      const [{ data: leads }, { data: orders }] = await Promise.all([
        leadsQuery,
        ordersQuery,
      ]);

      const totalLeads = leads?.length || 0;
      const contacted = leads?.filter((l: any) => l.status !== 'new').length || 0;
      const converted = leads?.filter((l: any) => l.is_converted).length || 0;
      const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;
      const revenue = orders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0;

      return {
        id: member.id,
        name: member.user?.full_name || 'Unknown',
        leads: totalLeads,
        contacted,
        converted,
        conversionRate,
        revenue,
      };
    })
  );

  // Sort by conversion rate
  teamPerformance.sort((a, b) => b.conversionRate - a.conversionRate);

  return {
    teamPerformance,
  };
}