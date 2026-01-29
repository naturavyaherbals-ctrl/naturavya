import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { linkAwbToShiprocket } from '@/lib/services/shiprocket';

// ------------------------------------------------------------------
// HELPER: Call Shiprocket to start tracking this AWB
// ------------------------------------------------------------------
async function registerTracking(awb: string, orderId: string) {
  try {
    const res = await linkAwbToShiprocket(awb);
    console.log(`[Shiprocket] Tracking check for ${awb} (Order ${orderId}):`, res);
  } catch (err) {
    console.error(`[Shiprocket] Failed to link AWB ${awb}:`, err);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const adminClient = createAdminClient();

    // 1. Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;
    const body = await request.json();
    const { status, awb_number, tracking_link } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // 2. Identify who is updating
    const { data: member } = await supabase
      .from('team_members')
      .select('id, name, role')
      .eq('user_id', user.id)
      .single();

    const updaterName = member?.name || user.email || 'System';
    const updaterRole = member?.role || 'user';

    // 3. Prepare update payload
    const updates: any = {
      status: status,
      current_status: status,
      status_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (awb_number) updates.awb_number = awb_number;
    if (tracking_link) updates.tracking_link = tracking_link;

    // Special handling
    if (status === 'rto') {
      updates.is_rto = true;
      updates.rto_initiated_at = new Date().toISOString();
    }
    if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }

    // 4. Update Order
    const { error: updateError } = await adminClient
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (updateError) {
      console.error('Order update failed:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // 5. Log History
    await adminClient.from('order_status_history').insert({
      order_id: orderId,
      new_status: status,
      notes: `Status updated to ${status} by ${updaterName}`,
      updated_by_name: updaterName,
      updated_by_role: updaterRole,
      created_at: new Date().toISOString(),
    });

    // 6. TRIGGER AUTO-TRACKING
    if (awb_number) {
      // Async call to register tracking (fire and forget)
      registerTracking(awb_number, orderId).catch(err => 
        console.error('Failed to register tracking:', err)
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}