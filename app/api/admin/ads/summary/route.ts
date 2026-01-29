import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get('start_date'); // ISO date (YYYY-MM-DD)
    const endDate = searchParams.get('end_date');     // ISO date (YYYY-MM-DD)
    const source = searchParams.get('source');        // e.g. "meta"
    const campaign = searchParams.get('campaign');    // exact match on campaign_label

    let query = supabase
      .from('lead_ads_performance_v')
      .select('*');

    if (startDate) {
      query = query.gte('day', startDate);
    }
    if (endDate) {
      // include full end-day
      query = query.lt('day', new Date(endDate + 'T23:59:59.999Z').toISOString());
    }
    if (source) {
      query = query.eq('source', source);
    }
    if (campaign) {
      query = query.eq('campaign_label', campaign);
    }

    const { data, error } = await query.order('leads_count', {
      ascending: false,
    });

    if (error) {
      console.error('lead_ads_performance_v error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch ads summary' },
        { status: 500 }
      );
    }

    const rows = data || [];

    // Aggregate totals
    const totals = rows.reduce(
      (acc: any, row: any) => {
        acc.leads += row.leads_count || 0;
        acc.converted_leads += row.converted_leads_count || 0;
        acc.orders += row.orders_count || 0;
        acc.revenue_total += Number(row.revenue_total || 0);
        acc.rto_orders += row.rto_orders_count || 0;
        acc.rto_revenue_lost += Number(row.rto_revenue_lost || 0);
        return acc;
      },
      {
        leads: 0,
        converted_leads: 0,
        orders: 0,
        revenue_total: 0,
        rto_orders: 0,
        rto_revenue_lost: 0,
      }
    );

    const overall_conv_pct =
      totals.leads > 0
        ? Number(
            (
              (totals.converted_leads || 0) /
              (totals.leads || 1)
            ).toFixed(4)
          ) * 100
        : 0;

    return NextResponse.json({
      success: true,
      data: rows,
      totals: {
        ...totals,
        overall_conv_pct: Number(overall_conv_pct.toFixed(2)),
      },
    });
  } catch (err: any) {
    console.error('GET /api/admin/ads/summary error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}