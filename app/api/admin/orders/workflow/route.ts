import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const adminClient = createAdminClient();
    const body = await request.json();
    
    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, orderId, data } = body;

    // 2. Action: Assign Order
    if (action === 'assign') {
      const { assignedToId } = data;
      
      const { error } = await adminClient
        .from('orders')
        .update({ 
          assigned_to: assignedToId,
          assigned_by: user.id,
          assigned_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      
      // Log history
      await adminClient.from('order_status_history').insert({
        order_id: orderId,
        new_status: 'assigned', // Pseudo-status for log
        notes: `Assigned to user ${assignedToId}`,
        updated_by_name: user.email,
        source: 'workflow'
      });

      return NextResponse.json({ success: true });
    }

    // 3. Action: Update Status (Sequence)
    if (action === 'update_status') {
      const { newStatus, metaData } = data;
      
      const updatePayload: any = {
        current_status: newStatus,
        status_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Handle logic for specific statuses
      if (newStatus === 'processing') updatePayload.packed_at = new Date().toISOString();
      if (newStatus === 'dispatched') {
        updatePayload.courier_partner = metaData?.courier;
        updatePayload.tracking_number = metaData?.tracking;
      }
      if (newStatus === 'ndr') {
        updatePayload.ndr_reason = metaData?.reason;
        // Increment attempts using SQL raw query ideally, but simpler here:
        // We'll handle increment in a stored procedure in production, 
        // but for now, we rely on the client or a separate fetch.
      }

      const { error } = await adminClient
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId);

      if (error) throw error;

      // Log History
      await adminClient.from('order_status_history').insert({
        order_id: orderId,
        previous_status: metaData?.oldStatus,
        new_status: newStatus,
        notes: metaData?.notes || `Status updated to ${newStatus}`,
        updated_by_name: user.email,
        source: 'workflow'
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}