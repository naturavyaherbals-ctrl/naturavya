export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const adminClient = createAdminClient();

    // 1. Identify logged-in agent
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Team member for this user (agent)
    const { data: member } = await supabase
      .from('team_members')
      .select('id, name, role')
      .eq('user_id', user.id)
      .single();

    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      leadId,
      items,
      paymentMethod,
      shippingCost,
      discount,
      tax,
    } = body;

    // 3. Basic validation
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields (Name, Phone, Items)' },
        { status: 400 }
      );
    }

    // 4. Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 1000
    )}`;

    // 5. Totals
    const subtotal = items.reduce((sum: number, item: any) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity || item.qty) || 0;
      return sum + price * qty;
    }, 0);

    const shipping_cost = parseFloat(shippingCost) || 0;
    const discount_val = parseFloat(discount) || 0;
    const tax_val = parseFloat(tax) || 0;
    const total = subtotal + shipping_cost + tax_val - discount_val;

    // Parse name for shipping fields
    const nameParts = String(customerName).trim().split(' ');
    const firstName = nameParts[0] || customerName;
    const lastName = nameParts.slice(1).join(' ') || '';

    const nowIso = new Date().toISOString();

    // 6. Prepare order row (match orders table columns)
    const orderData: any = {
      order_number: orderNumber,

      customer_name: customerName,
      customer_email: customerEmail || null,
      customer_phone: customerPhone,

      // generic address fields
      phone: customerPhone,
      address: shippingAddress?.line1 || null,
      city: shippingAddress?.city || null,
      state: shippingAddress?.state || null,
      zip_code: shippingAddress?.postalCode || null,

      // shipping_* fields
      shipping_first_name: firstName,
      shipping_last_name: lastName || null,
      shipping_phone: customerPhone,
      shipping_address_line1: shippingAddress?.line1 || null,
      shipping_city: shippingAddress?.city || null,
      shipping_state: shippingAddress?.state || null,
      shipping_postal_code: shippingAddress?.postalCode || null,

      // assignment / ownership
      assigned_to: null, // separate from agent; keep null for now
      created_by_agent: member?.id || null,

      items, // jsonb
      subtotal,
      shipping_cost,
      tax: tax_val,
      discount: discount_val,
      total,

      payment_method: paymentMethod || 'cod',
      payment_status:
        paymentMethod === 'prepaid' ? 'paid' : 'pending',

      status: 'confirmed',
      current_status: 'confirmed',
      status_updated_at: nowIso,
      created_at: nowIso,
    };

    // 7. Insert into orders
    const { data: newOrder, error: insertError } = await adminClient
      .from('orders')
      .insert(orderData)
      .select('*')
      .single();

    if (insertError || !newOrder) {
      console.error('❌ orders insert error:', insertError);
      return NextResponse.json(
        { error: insertError?.message || 'Insert failed' },
        { status: 500 }
      );
    }

    // 8. Status history log
    await adminClient.from('order_status_history').insert({
      order_id: newOrder.id,
      new_status: 'confirmed',
      notes:
        'Manual order created by ' + (member?.name || 'Admin'),
      updated_by_name: member?.name || 'Admin',
      updated_by_role: member?.role || 'admin',
    });

    // 9. Link to lead if present (so lead shows converted + order)
    if (leadId) {
      try {
        await adminClient
          .from('leads')
          .update({
            is_converted: true,
            converted_order_id: newOrder.id,
            converted_at: nowIso,
            status: 'order_confirmed',
          })
          .eq('id', leadId);

        // optional: log lead activity
        await adminClient.from('lead_activities').insert({
          lead_id: leadId,
          activity_type: 'order',
          description:
            'Order created from CRM manual form: ' +
            orderNumber,
          created_at: nowIso,
        });
      } catch (e) {
        console.error('Lead link/update failed:', e);
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId: newOrder.id,
    });
  } catch (error: any) {
    console.error('API Crash /admin/orders/manual:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}