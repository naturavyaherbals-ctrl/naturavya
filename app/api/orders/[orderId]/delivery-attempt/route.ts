import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DeliveryAttemptRequest } from '@/types/status';
import { sendDeliveryAttemptNotification } from '@/lib/notifications/order-notifications';

// POST /api/orders/[orderId]/delivery-attempt
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ orderId: string }> } // 👈 Correct type
) {
  try {
    const params = await props.params; // 👈 Await params
    const { orderId } = params;
    
    const supabase = await createServerSupabaseClient();
    const body: DeliveryAttemptRequest = await request.json();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (!body.result) {
      return NextResponse.json({ error: 'result is required' }, { status: 400 });
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('delivery_attempts_count, max_delivery_attempts, customer_email, customer_phone')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // ---------------------------------------------------------
    // ATTEMPT 1: Try using RPC
    // ---------------------------------------------------------
    const { data: result, error: rpcError } = await supabase.rpc('record_delivery_attempt', {
      p_order_id: orderId,
      p_result: body.result,
      p_result_description: body.result_description || null,
      p_delivery_person_name: body.delivery_person_name || null,
      p_delivery_person_phone: body.delivery_person_phone || null,
      p_customer_response: body.customer_response || null,
      p_reschedule_requested: body.reschedule_requested || false,
      p_rescheduled_date: body.rescheduled_date || null,
      p_notes: body.notes || null,
      p_recorded_by: user.id,
      p_recorded_by_name: profile?.full_name || user.email,
    });

    let attemptData = result;

    // ---------------------------------------------------------
    // ATTEMPT 2: Fallback to Manual Logic
    // ---------------------------------------------------------
    if (rpcError) {
      console.warn('RPC Failed, falling back manually:', rpcError.message);
      
      const attemptNumber = (order.delivery_attempts_count || 0) + 1;
      const newStatus = `delivery_attempt_${attemptNumber}`;

      // 1. Update Order Status
      await supabase.from('orders').update({
        current_status: newStatus,
        delivery_attempts_count: attemptNumber,
        status_updated_at: new Date().toISOString()
      }).eq('id', orderId);

      // 2. Add Status History
      const { data: history } = await supabase.from('order_status_history').insert({
        order_id: orderId,
        new_status: newStatus,
        notes: body.notes,
        updated_by_name: profile?.full_name || user.email,
        source: 'manual'
      }).select().single();

      // 3. Record Attempt
      const { data: attempt } = await supabase.from('delivery_attempts').insert({
        order_id: orderId,
        status_history_id: history?.id,
        attempt_number: attemptNumber,
        result: body.result,
        result_description: body.result_description,
        notes: body.notes,
        reschedule_requested: body.reschedule_requested,
        rescheduled_date: body.rescheduled_date,
        recorded_by_name: profile?.full_name || user.email
      }).select().single();

      attemptData = {
        success: true,
        attempt_id: attempt?.id,
        attempt_number: attemptNumber,
        new_status: newStatus
      };
    }

    // Send notification
    if (body.notify_customer) {
      await sendDeliveryAttemptNotification({
        orderId,
        attemptNumber: attemptData.attempt_number,
        result: body.result,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        rescheduledDate: body.rescheduled_date,
      });
    }

    return NextResponse.json(attemptData);

  } catch (error: any) {
    console.error('Delivery attempt API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}