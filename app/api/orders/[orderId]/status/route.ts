import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { StatusUpdateRequest } from '@/types/status';
import { isValidTransition } from '@/types/status';
import { sendStatusNotification } from '@/lib/notifications/order-notifications';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ orderId: string }> }
) {
  try {
    const params = await props.params;
    const { orderId } = params;
    
    const supabase = await createServerSupabaseClient();
    
    // Parse Body
    // We handle both simple { new_status } and complex { new_status, workflow_data } payloads
    const body = await request.json();
    const newStatus = body.new_status || body.newStatus;
    const workflowData = body.workflow_data || {};
    const notes = body.notes || workflowData.customer_remarks || workflowData.call_response || null;
    const internalNotes = body.internal_notes || null;
    const notifyCustomer = body.notify_customer || false;

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get User Profile (for history logs)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single();

    const userName = profile?.full_name || user.email;
    const userRole = profile?.role || 'admin';

    // 3. Validation
    if (!newStatus) {
      return NextResponse.json({ error: 'new_status is required' }, { status: 400 });
    }

    // 4. Get Current Order Status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('current_status, delivery_attempts_count, customer_email, customer_phone')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 5. Validate Transition (Optional - can be strict or loose depending on requirements)
    // if (!isValidTransition(order.current_status, newStatus)) {
    //   return NextResponse.json({ error: `Invalid transition from ${order.current_status} to ${newStatus}` }, { status: 400 });
    // }

    // ---------------------------------------------------------
    // 6. PREPARE LOGISTICS DATA (If provided)
    // ---------------------------------------------------------
    const logisticsUpdates: any = {};
    if (workflowData.awb_number) logisticsUpdates.awb_number = workflowData.awb_number;
    if (workflowData.courier_name) logisticsUpdates.courier_name = workflowData.courier_name;
    if (workflowData.package_weight) logisticsUpdates.package_weight = parseFloat(workflowData.package_weight);
    if (workflowData.package_dimensions) logisticsUpdates.package_dimensions = workflowData.package_dimensions;
    if (workflowData.delivery_boy_name) logisticsUpdates.delivery_boy_name = workflowData.delivery_boy_name;
    if (workflowData.delivery_boy_phone) logisticsUpdates.delivery_boy_phone = workflowData.delivery_boy_phone;
    if (workflowData.pod_link) logisticsUpdates.pod_link = workflowData.pod_link;
    
    // Only update logistics fields if they exist
    const hasLogisticsUpdates = Object.keys(logisticsUpdates).length > 0;

    // ---------------------------------------------------------
    // ATTEMPT 1: Try using RPC (Stored Procedure)
    // ---------------------------------------------------------
    // Note: The standard RPC `update_order_status` might not accept logistics columns.
    // If you haven't updated the RPC function, it will ignore these extra fields.
    
    const { data: result, error: rpcError } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_new_status: newStatus,
      p_notes: notes,
      p_internal_notes: internalNotes,
      p_updated_by: user.id,
      p_updated_by_name: userName,
      p_updated_by_role: userRole,
      p_source: 'manual',
    });

    // ---------------------------------------------------------
    // ATTEMPT 2: Fallback to Manual Update if RPC fails or is missing
    // ---------------------------------------------------------
    if (rpcError) {
      console.warn('RPC Failed/Missing, using manual update strategy:', rpcError.message);
      
      const updatePayload = {
        current_status: newStatus,
        status_updated_at: new Date().toISOString(),
        // Increment attempts logic
        delivery_attempts_count: newStatus.startsWith('delivery_attempt') 
          ? (order.delivery_attempts_count || 0) + 1 
          : order.delivery_attempts_count,
        // Mark RTO logic
        is_rto: newStatus.startsWith('rto_') ? true : false,
        // Merge logistics data
        ...logisticsUpdates 
      };

      // 1. Update Order Table
      const { error: updateError } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId);

      if (updateError) throw updateError;

      // 2. Add History Entry
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        previous_status: order.current_status,
        new_status: newStatus,
        notes: notes,
        internal_notes: internalNotes,
        updated_by_name: userName,
        updated_by_role: userRole,
        source: 'manual',
        // Save the detailed workflow data as metadata snapshot
        metadata: workflowData 
      });

    } else {
      // RPC Succeeded - But we might still need to save logistics data 
      // if the RPC function didn't handle it.
      if (hasLogisticsUpdates) {
        await supabase.from('orders').update(logisticsUpdates).eq('id', orderId);
      }
      
      // Update the history record with metadata (RPC doesn't usually accept JSONB)
      // We find the latest history record we just created and patch it
      if (Object.keys(workflowData).length > 0) {
        await supabase.from('order_status_history')
          .update({ metadata: workflowData })
          .eq('order_id', orderId)
          .eq('new_status', newStatus)
          .order('created_at', { ascending: false })
          .limit(1);
      }
    }

    // 7. Send Notification
    if (notifyCustomer) {
      await sendStatusNotification({
        orderId,
        newStatus: newStatus,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        notes: notes,
      });
    }

    return NextResponse.json({
      success: true,
      new_status: newStatus,
    });

  } catch (error: any) {
    console.error('Status API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}