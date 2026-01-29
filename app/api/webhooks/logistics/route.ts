import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    // 1. SHIPROCKET VERIFICATION PING (Empty or test body)
    // Always return 200 to let Shiprocket save the webhook
    if (!body || (!body.awb && !body.awb_number)) {
      console.log('Shiprocket verification ping received.');
      return NextResponse.json({ success: true, message: 'Webhook verified' });
    }

    const adminClient = createAdminClient();
    const awb = body.awb || body.awb_number;
    const newStatus = body.current_status || body.status;
    const trackingLink = body.tracking_url;

    if (!awb || !newStatus) {
      return NextResponse.json({ success: true, message: 'Ignored invalid payload' });
    }

    // 2. Find order
    const { data: order } = await adminClient
      .from('orders')
      .select('id, current_status')
      .eq('awb_number', awb)
      .single();

    if (!order) {
      console.log('Order not found for AWB:', awb);
      return NextResponse.json({ success: true, message: 'Order not found' });
    }

    // 3. Map status
    let internalStatus = order.current_status;
    const s = String(newStatus).toUpperCase();

    if (s.includes('DELIVERED')) internalStatus = 'delivered';
    else if (s.includes('RTO')) internalStatus = 'rto';
    else if (s.includes('SHIPPED') || s.includes('TRANSIT') || s.includes('PICKED')) internalStatus = 'shipped';
    else if (s.includes('CANCEL')) internalStatus = 'cancelled';

    // 4. Update
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
    console.error('Webhook Error:', error);
    // Return 200 even on error to prevent Shiprocket disable
    return NextResponse.json({ success: true, error: error.message });
  }
}