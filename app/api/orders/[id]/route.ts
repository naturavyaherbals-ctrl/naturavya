// =====================================================
// SINGLE ORDER API - GET, UPDATE, DELETE
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// =====================================================
// GET - SINGLE ORDER
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = params;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        items:order_items(*),
        status_history:order_status_history(*, created_by_user:users(full_name)),
        assigned_team_member:team_members(*, user:users(*))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - UPDATE ORDER
// =====================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = params;
    const body = await request.json();

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Get current order status
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();

    // Update order
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If status changed, create history entry
    if (body.status && body.status !== currentOrder?.status) {
      await supabase
        .from('order_status_history')
        .insert({
          order_id: id,
          status: body.status,
          notes: body.status_notes,
          created_by: userId,
        });

      // Update timestamps based on status
      const statusUpdates: Record<string, string> = {};
      
      if (body.status === 'confirmed') {
        statusUpdates.confirmed_at = new Date().toISOString();
      } else if (body.status === 'shipped') {
        statusUpdates.shipped_at = new Date().toISOString();
      } else if (body.status === 'delivered') {
        statusUpdates.delivered_at = new Date().toISOString();
      } else if (body.status === 'cancelled') {
        statusUpdates.cancelled_at = new Date().toISOString();
      }

      if (Object.keys(statusUpdates).length > 0) {
        await supabase
          .from('orders')
          .update(statusUpdates)
          .eq('id', id);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - CANCEL ORDER
// =====================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = params;

    // Soft delete - just update status to cancelled
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Restore inventory
    const adminClient = createAdminClient();
    const { data: orderItems } = await adminClient
      .from('order_items')
      .select('product_id, variant_id, quantity')
      .eq('order_id', id);

    if (orderItems) {
      for (const item of orderItems) {
        await adminClient.rpc('restore_inventory', {
          p_product_id: item.product_id,
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
        });
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}