import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { orderService } from '@/lib/services/orderService';
import { leadService } from '@/lib/services/leadService';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Verify admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user?.id)
      .single();

    if (!userData || !['super_admin', 'admin', 'manager'].includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();

    // Get order stats
    const orderStats = await orderService.getDashboardStats();

    // Get lead stats
    const leadStats = await leadService.getLeadStats();

    // Get low stock products
    const { data: lowStockProducts } = await adminClient
      .from('inventory')
      .select('*, product:products(id, name, sku)')
      .lt('quantity', adminClient.rpc('get_low_stock_threshold'))
      .eq('track_inventory', true)
      .limit(10);

    // Get recent orders
    const { orders: recentOrders } = await orderService.getOrdersForAdmin({
      limit: 5,
    });

    // Get recent leads
    const { leads: recentLeads } = await leadService.getLeads({
      limit: 5,
    });

    // Get revenue chart data (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const { data: revenueData } = await adminClient
      .from('orders')
      .select('created_at, total_amount')
      .gte('created_at', `${last7Days[0]}T00:00:00`)
            .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

    // Aggregate revenue by day
    const revenueByDay = last7Days.map((date) => {
      const dayRevenue = revenueData
        ?.filter((order) => order.created_at.startsWith(date))
        .reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      
      return {
        date,
        revenue: dayRevenue,
      };
    });

    // Get order status distribution
    const { data: statusDistribution } = await adminClient
      .from('orders')
      .select('status')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const statusCounts = statusDistribution?.reduce((acc: Record<string, number>, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get top selling products
    const { data: topProducts } = await adminClient
      .from('order_items')
      .select('product_id, product_name, quantity')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const productSales = topProducts?.reduce((acc: Record<string, { name: string; quantity: number }>, item) => {
      if (!acc[item.product_id]) {
        acc[item.product_id] = { name: item.product_name, quantity: 0 };
      }
      acc[item.product_id].quantity += item.quantity;
      return acc;
    }, {}) || {};

    const topSellingProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        orders: orderStats,
        leads: leadStats,
        lowStockProducts: lowStockProducts || [],
        recentOrders,
        recentLeads,
        charts: {
          revenue: revenueByDay,
          orderStatus: statusCounts,
          topProducts: topSellingProducts,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
