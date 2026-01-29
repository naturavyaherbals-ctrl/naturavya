import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Shiprocket Header (Security)
    // Shiprocket sends 'x-shiprocket-token' header. 
    // You should verify this matches what you set in their dashboard.
    const secret = req.headers.get('x-shiprocket-token');
    if (process.env.SHIPROCKET_WEBHOOK_SECRET && secret !== process.env.SHIPROCKET_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const adminClient = createAdminClient();

    // Shiprocket payload usually looks like:
    // { awb: "...", current_status: "DELIVERED", ... }
    const awb = body.awb;
    const newStatus = body.current_status;
    const trackingLink = body.tracking_url;

    if (!awb || !newStatus) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    console.log(`[Webhook] Update for AWB ${awb}: ${newStatus}`);

    // Find order
    const { data: order } = await adminClient
      .from('orders')
      .select('id, current_status')
      .eq('awb_number', awb)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Map Shiprocket status to internal
    let internalStatus = order.current_status;
    const s = newStatus.toUpperCase();

    if (s === 'DELIVERED') internalStatus = 'delivered';
    else if (s === 'RTO INITIATED' || s === 'RTO DELIVERED') internalStatus = 'rto';
    else if (s === 'SHIPPED' || s === 'IN TRANSIT' || s === 'OUT FOR DELIVERY') internalStatus = 'shipped';
    else if (s === 'CANCELED') internalStatus = 'cancelled';

    // Update if changed
    if (internalStatus !== order.current_status) {
      const updates: any = {
        current_status: internalStatus,
        status: internalStatus,
        status_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (internalStatus === 'delivered') updates.delivered_at = new Date().toISOString();
      if (internalStatus === 'rto') {
        updates.is_rto = true;
        updates.rto_initiated_at = new Date().toISOString();
      }
      if (trackingLink) updates.tracking_link = trackingLink;

      await adminClient.from('orders').update(updates).eq('id', order.id);

      await adminClient.from('order_status_history').insert({
        order_id: order.id,
        new_status: internalStatus,
        notes: `Shiprocket Update: ${newStatus}`,
        updated_by_name: 'Shiprocket',
        updated_by_role: 'system',
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Shiprocket webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}