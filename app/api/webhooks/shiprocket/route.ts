import { NextRequest, NextResponse } from 'next/server';
import { createAutoTask } from '@/lib/tasks/auto-create-task';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const {
      awb,
      current_status,
      shipment_status,
      order_id,
      scans,
    } = payload;

    if (!awb) {
      return NextResponse.json({ success: true });
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id, assigned_to, customer_phone')
      .eq('awb_number', awb)
      .single();

    if (!order) {
      return NextResponse.json({ success: true });
    }

    /* ===== NDR / FAILED ===== */
    if (
      shipment_status?.toLowerCase().includes('failed') ||
      current_status?.toLowerCase().includes('ndr')
    ) {
      await createAutoTask({
        title: 'Resolve NDR',
        description: 'Delivery failed. Call customer and update address.',
        order_id: order.id,
        assigned_to: order.assigned_to,
        task_type: 'ndr',
        priority: 'urgent',
        meta: { awb, scans },
      });
    }

    /* ===== DELIVERED ===== */
    if (shipment_status === 'Delivered') {
      await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('order_id', order.id)
        .neq('status', 'completed');
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Shiprocket webhook error:', e);
    return NextResponse.json({ success: true });
  }
}
