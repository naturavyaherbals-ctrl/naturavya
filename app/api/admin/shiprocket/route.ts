import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const supabase = createClient();

    const {
      awb,
      shipment_status,
      shipment_status_id,
      current_status,
      current_timestamp,
      scans,
    } = payload;

    if (!awb) {
      return NextResponse.json(
        { success: false, error: 'AWB missing' },
        { status: 400 }
      );
    }

    /* ===============================
       FIND ORDER BY AWB
    ================================ */
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('awb_number', awb.toString())
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found for AWB' },
        { status: 200 } // Shiprocket expects 200
      );
    }

    /* ===============================
       PREPARE ORDER UPDATE
    ================================ */
    const updates: any = {
      status_updated_at: new Date().toISOString(),
      auto_actions: payload,
    };

    const statusText =
      shipment_status ||
      current_status ||
      payload.shipment_status ||
      '';

    const statusLower = statusText.toLowerCase();

    /* ===============================
       STATUS MAPPING
    ================================ */
    if (statusLower.includes('delivered')) {
      updates.current_status = 'delivered';
      updates.delivered_at = new Date().toISOString();
    }

    if (statusLower.includes('out for delivery')) {
      updates.current_status = 'out_for_delivery';
    }

    if (
      statusLower.includes('ndr') ||
      statusLower.includes('not delivered')
    ) {
      updates.current_status = 'ndr';
      updates.ndr_count = (order.ndr_count || 0) + 1;
      updates.ndr_reason =
        scans?.[0]?.activity || 'Non-delivery reported';
    }

    if (statusLower.includes('rto')) {
      updates.is_rto = true;
      updates.current_status = 'rto';
      updates.rto_initiated_at = new Date().toISOString();
    }

    /* ===============================
       UPDATE ORDER
    ================================ */
    await supabase
      .from('orders')
      .update(updates)
      .eq('id', order.id);

    /* ===============================
       TASK ENGINE
    ================================ */
    const createTask = async (
      title: string,
      priority: 'low' | 'medium' | 'high'
    ) => {
      // Prevent duplicate pending task of same type
      const { data: existing } = await supabase
        .from('tasks')
        .select('id')
        .eq('related_order_id', order.id)
        .eq('title', title)
        .eq('status', 'pending')
        .limit(1);

      if (existing && existing.length > 0) return;

      await supabase.from('tasks').insert({
        title,
        priority,
        status: 'pending',
        related_order_id: order.id,
        related_lead_id: order.lead_id || null,
        assigned_to: order.assigned_to || null,
        meta: {
          awb,
          shiprocket_status: statusText,
        },
      });
    };

    /* ===============================
       TASK RULES
    ================================ */
    if (statusLower.includes('out for delivery')) {
      await createTask(
        'Inform customer: Out for delivery',
        'medium'
      );
    }

    if (
      statusLower.includes('ndr') ||
      statusLower.includes('not delivered')
    ) {
      await createTask(
        'NDR: Call customer & reattempt delivery',
        'high'
      );
    }

    if (statusLower.includes('delivered')) {
      // Auto-close all pending tasks for this order
      await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('related_order_id', order.id)
        .eq('status', 'pending');
    }

    if (statusLower.includes('rto')) {
      await createTask(
        'RTO: Investigate & recovery action',
        'high'
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Shiprocket webhook error:', error);
    return NextResponse.json(
      { success: false },
      { status: 200 } // IMPORTANT: always 200 for Shiprocket
    );
  }
}
