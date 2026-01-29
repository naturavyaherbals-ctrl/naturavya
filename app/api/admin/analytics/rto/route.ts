import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);

    const endParam = searchParams.get('end_date');
    const startParam = searchParams.get('start_date');

    const today = new Date();
    const defaultEnd = today.toISOString().slice(0, 10);
    const defaultStart = new Date(
      today.getTime() - 30 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 10);

    const start_date = startParam || defaultStart;
    const end_date = endParam || defaultEnd;

    const limitCourier = Number(searchParams.get('limit_courier') || 50);
    const limitPincode = Number(searchParams.get('limit_pincode') || 100);
    const limitAgent = Number(searchParams.get('limit_agent') || 50);

    const [
      { data: byCourier, error: errCourier },
      { data: byPincode, error: errPincode },
      { data: byAgent, error: errAgent },
    ] = await Promise.all([
      supabase.rpc('get_rto_stats_by_courier', {
        p_start_date: start_date,
        p_end_date: end_date,
        p_limit: limitCourier,
      }),
      supabase.rpc('get_rto_stats_by_pincode', {
        p_start_date: start_date,
        p_end_date: end_date,
        p_limit: limitPincode,
      }),
      supabase.rpc('get_rto_stats_by_agent', {
        p_start_date: start_date,
        p_end_date: end_date,
        p_limit: limitAgent,
      }),
    ]);

    if (errCourier || errPincode || errAgent) {
      console.error('RTO RPC errors:', {
        errCourier,
        errPincode,
        errAgent,
      });
      return NextResponse.json(
        { success: false, error: 'Failed to fetch RTO stats' },
        { status: 500 }
      );
    }

    const courierRows = byCourier || [];
    const agentRows = byAgent || [];

    const totals = courierRows.reduce(
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

    const overall_rto_rate_pct =
      totals.total_orders > 0
        ? Number(
            (
              (totals.rto_orders || 0) /
              (totals.total_orders || 1)
            ).toFixed(4)
          ) * 100
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        by_courier: courierRows,
        by_pincode: byPincode || [],
        by_agent: agentRows,
        totals: {
          ...totals,
          overall_rto_rate_pct: Number(
            overall_rto_rate_pct.toFixed(2)
          ),
        },
        date_range: {
          start_date,
          end_date,
        },
      },
    });
  } catch (err: any) {
    console.error('GET /api/admin/analytics/rto error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}