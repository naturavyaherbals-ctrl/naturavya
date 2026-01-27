import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RTOInitiationRequest } from '@/types/status';

// POST /api/orders/[orderId]/rto - Initiate RTO
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { orderId } = params;
    const body: RTOInitiationRequest = await request.json();

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
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Validate required fields
    if (!body.reason) {
      return NextResponse.json(
        { error: 'reason is required for RTO' },
        { status: 400 }
      );
    }

    // Update order status to RTO
    const { data: statusResult, error: statusError } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_new_status: 'rto_initiated',
      p_notes: body.reason,
      p_internal_notes: body.notes || null,
      p_updated_by: user.id,
      p_updated_by_name: profile?.full_name || user.email,
      p_updated_by_role: 'admin',
      p_source: 'manual',
    });

    if (statusError || !statusResult.success) {
      return NextResponse.json(
        { error: statusResult?.error || 'Failed to initiate RTO' },
        { status: 400 }
      );
    }

    // Create RTO details record
    const { data: rtoDetails, error: rtoError } = await supabase
      .from('order_rto_details')
      .insert({
        order_id: orderId,
        reason: body.reason,
        reason_category: body.reason_category,
        initiated_by: user.id,
        initiated_by_name: profile?.full_name || user.email,
      })
      .select()
      .single();

    if (rtoError) {
      console.error('Error creating RTO details:', rtoError);
    }

    return NextResponse.json({
      success: true,
      rto_id: rtoDetails?.id,
      new_status: 'rto_initiated',
      history_id: statusResult.history_id,
    });
  } catch (error) {
    console.error('RTO API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[orderId]/rto - Update RTO status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { orderId } = params;
    const body = await request.json();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update RTO details
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.rto_tracking_number) updates.rto_tracking_number = body.rto_tracking_number;
    if (body.rto_courier_partner) updates.rto_courier_partner = body.rto_courier_partner;
    if (body.return_condition) updates.return_condition = body.return_condition;
    if (body.condition_notes) updates.condition_notes = body.condition_notes;
    if (body.refund_initiated !== undefined) updates.refund_initiated = body.refund_initiated;
    if (body.refund_amount) updates.refund_amount = body.refund_amount;

    const { error: updateError } = await supabase
      .from('order_rto_details')
      .update(updates)
      .eq('order_id', orderId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update RTO details' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('RTO update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}