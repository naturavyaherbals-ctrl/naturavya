// app/api/place-order/route.ts
import 'server-only';

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cartItems, shippingDetails, paymentMethod, paymentId, total } = body;

    if (!shippingDetails?.phone || !shippingDetails?.firstName || !shippingDetails?.address) {
      return NextResponse.json(
        { success: false, error: 'Missing shipping details' },
        { status: 400 }
      );
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const fullName = `${shippingDetails.firstName} ${shippingDetails.lastName || ''}`.trim();

    // IMPORTANT: Match your real orders table columns:
    // - user_name (not customer_name)
    // - customer_email
    // - items (not products)
    // - total_amount + total exist; we set both for compatibility
    // - status should be lowercase and consistent
    const insertPayload = {
      user_name: fullName,
      customer_email: shippingDetails.email ?? null,
      phone: shippingDetails.phone ?? null,

      address: shippingDetails.address ?? null,
      city: shippingDetails.city ?? null,
      state: shippingDetails.state ?? null,
      zip_code: shippingDetails.pincode ?? shippingDetails.zip_code ?? null,

      shipping_first_name: shippingDetails.firstName ?? null,
      shipping_last_name: shippingDetails.lastName ?? null,
      shipping_phone: shippingDetails.phone ?? null,
      shipping_address_line1: shippingDetails.address ?? null,
      shipping_city: shippingDetails.city ?? null,

      items: cartItems,
      subtotal: total ?? 0,
      total: total ?? 0,
      total_amount: total ?? 0,

      payment_method: paymentMethod ?? null,
      payment_status: paymentMethod === 'online' ? 'paid' : 'pending',

      // Normalize status (your DB currently has mostly NULL + pending_verification)
      status: 'pending_verification',

      // If you want to store Razorpay payment id, add column (SQL below)
      payment_id: paymentId ?? null,
    };

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert([insertPayload])
      .select('*')
      .single();

    if (orderErr || !order) {
      console.error('Supabase Insert Error:', orderErr);
      return NextResponse.json(
        { success: false, error: orderErr?.message || 'Order insert failed' },
        { status: 500 }
      );
    }

    // Link order → lead (phone match) to update CRM conversion automatically
    // This uses your real leads columns: is_converted, converted_order_id, converted_at, status
    const phone = shippingDetails.phone;
    await supabase
      .from('leads')
      .update({
        is_converted: true,
        converted_order_id: order.id,
        converted_at: new Date().toISOString(),
        status: 'order_confirmed',
      })
      .eq('phone', phone)
      .eq('is_converted', false);

    // Optional: send email (use request.url base)
    try {
      const url = new URL('/api/send-order-email', request.url);
      await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          customerName: fullName,
          customerEmail: shippingDetails.email,
          totalAmount: total,
          items: cartItems,
        }),
      });
    } catch (e) {
      console.error('Email failed:', e);
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}