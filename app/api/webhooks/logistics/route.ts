// app/api/webhooks/logistics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('x-api-key');
    if (token !== process.env.SHIPROCKET_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();

    const {
      awb,
      order_id,
      current_status,
      shipment_status,
      current_timestamp,
    } = payload;

    const statusText = (current_status || shipment_status || '').toLowerCase();

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .or(`awb_number.eq.${awb},id.eq.${order_id}`)
      .single();

    if (!order) return NextResponse.json({ success: true });

    let newStatus = order.status;
    let isNdr = false;

    if (statusText.includes('ndr') || statusText.includes('not delivered')) {
      newStatus = 'ndr';
      isNdr = true;
    } else if (statusText.includes('delivered')) {
      newStatus = 'delivered';
    }

    await supabase
      .from('orders')
      .update({
        status: newStatus,
        last_tracking_status: current_status,
        last_tracking_at: new Date(),
        tracking_payload: payload,
      })
      .eq('id', order.id);

    /* ================= AUTO NDR TASK ================= */

    if (isNdr) {
      const { data: existingTask } = await supabase
        .from('tasks')
        .select('id')
        .eq('related_order_id', order.id)
        .eq('type', 'ndr')
        .eq('status', 'pending')
        .single();

      if (!existingTask) {
        await supabase.from('tasks').insert({
          type: 'ndr',
          title: 'NDR Follow-up',
          description: `Courier NDR reported. Call customer & confirm delivery.\nAWB: ${order.awb_number}`,
          assigned_to: order.assigned_to,
          related_order_id: order.id,
          related_lead_id: order.lead_id,
          priority: 2,
          status: 'pending',
          due_at: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 hours
          meta: {
            source: 'shiprocket',
            awb: order.awb_number,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Shiprocket webhook error:', e);
    return NextResponse.json({ success: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
