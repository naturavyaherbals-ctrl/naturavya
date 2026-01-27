import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { OrderStatus } from '@/types/order';
import { isValidTransition } from '@/types/status';

interface BulkStatusUpdateRequest {
  order_ids: string[];
  new_status: OrderStatus;
  notes?: string;
  notify_customers?: boolean;
}

// POST /api/orders/bulk-status - Bulk update order statuses
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const body: BulkStatusUpdateRequest = await request.json();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single();

    // Validate request
    if (!body.order_ids || body.order_ids.length === 0) {
      return NextResponse.json(
        { error: 'order_ids array is required' },
        { status: 400 }
      );
    }

    if (!body.new_status) {
      return NextResponse.json(
        { error: 'new_status is required' },
        { status: 400 }
      );
    }

    // Limit bulk operations
    if (body.order_ids.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 orders can be updated at once' },
        { status: 400 }
      );
    }

    // Get current statuses for all orders
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, current_status')
      .in('id', body.order_ids);

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    const results = {
      successful: [] as string[],
      failed: [] as { order_id: string; error: string }[],
      skipped: [] as { order_id: string; reason: string }[],
    };

    // Process each order
    for (const order of orders || []) {
      // Check if transition is valid
      if (!isValidTransition(order.current_status, body.new_status)) {
        results.skipped.push({
          order_id: order.id,
          reason: `Invalid transition from ${order.current_status}`,
        });
        continue;
      }

      // Update status
      const { data: result, error: updateError } = await supabase.rpc('update_order_status', {
        p_order_id: order.id,
        p_new_status: body.new_status,
        p_notes: body.notes || null,
        p_internal_notes: null,
        p_updated_by: user.id,
        p_updated_by_name: profile?.full_name || user.email,
        p_updated_by_role: profile?.role || 'admin',
        p_source: 'manual',
      });

      if (updateError || !result.success) {
        results.failed.push({
          order_id: order.id,
          error: result?.error || updateError?.message || 'Unknown error',
        });
      } else {
        results.successful.push(order.id);
      }
    }

    // Find orders that weren't found
    const processedIds = orders?.map((o) => o.id) || [];
    const notFoundIds = body.order_ids.filter((id) => !processedIds.includes(id));
    notFoundIds.forEach((id) => {
      results.failed.push({ order_id: id, error: 'Order not found' });
    });

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: body.order_ids.length,
        successful: results.successful.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
      },
    });
  } catch (error) {
    console.error('Bulk status update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}