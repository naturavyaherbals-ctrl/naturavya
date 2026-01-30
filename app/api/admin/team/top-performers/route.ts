// =====================================================
// TOP PERFORMERS API
// =====================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '5');
    const period = searchParams.get('period') || 'month'; // 'today', 'week', 'month'

    // Get date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const startDateISO = startDate.toISOString();

    // Get all team members with their stats
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select(`
        id,
        user:users(id, full_name, avatar_url)
      `)
      .eq('is_available', true);

    if (!teamMembers || teamMembers.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Calculate performance for each team member
    const performanceData = await Promise.all(
      teamMembers.map(async (member) => {
        const [
          { count: leadsAssigned },
          { count: leadsConverted },
          { data: ordersData },
        ] = await Promise.all([
          supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', member.id)
            .gte('assigned_at', startDateISO),
          
          supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', member.id)
            .eq('is_converted', true)
            .gte('converted_at', startDateISO),
          
          supabase
            .from('orders')
            .select('total')
            .eq('assigned_to', member.id)
            .gte('created_at', startDateISO)
            .in('status', ['confirmed', 'processing', 'shipped', 'delivered']),
        ]);

        const revenue = ordersData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
        const conversionRate = leadsAssigned && leadsAssigned > 0
          ? Math.round((leadsConverted || 0) / leadsAssigned * 100)
          : 0;

        return {
          team_member_id: member.id,
          name: member.user?.full_name || 'Unknown',
          avatar_url: member.user?.avatar_url,
          leads_assigned: leadsAssigned || 0,
          leads_converted: leadsConverted || 0,
          orders: ordersData?.length || 0,
          revenue,
          conversion_rate: conversionRate,
        };
      })
    );

    // Sort by conversion rate (or revenue) and take top performers
    const topPerformers = performanceData
      .sort((a, b) => b.conversion_rate - a.conversion_rate || b.revenue - a.revenue)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: topPerformers,
    });
  } catch (error: any) {
    console.error('Error fetching top performers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}