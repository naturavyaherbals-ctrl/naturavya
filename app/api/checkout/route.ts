export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { orderService, CheckoutData, CartItemForOrder } from '@/lib/services/orderService';
import { cartService } from '@/lib/services/cartService';
import { validateCheckoutForm, sanitizePhone } from '@/lib/utils/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      paymentMethod = 'cod',
      notes,
      cartItems,
    } = body;

    // Validate form data
    const validation = validateCheckoutForm({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      address: addressLine1,
      city,
      state,
      pincode,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    // Validate cart items
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Prepare checkout data
    const checkoutData: CheckoutData = {
      customerName,
      customerPhone: sanitizePhone(customerPhone),
      customerEmail,
      shippingAddress: {
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country: 'India',
      },
      paymentMethod,
      notes,
      userId: user?.id,
      source: 'website',
    };

    // Prepare cart items for order
    const orderItems: CartItemForOrder[] = cartItems.map((item: any) => ({
      productId: item.product.id,
      productName: item.product.name,
      variantId: item.variant?.id,
      variantName: item.variant?.name,
      sku: item.variant?.sku || item.product.sku,
      quantity: item.quantity,
      unitPrice: item.price,
      taxAmount: (item.price * item.quantity * 0.18), // 18% GST
    }));

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal >= 499 ? 0 : 50; // Free shipping above ₹499
    const discount = 0; // Apply coupon discount if any
    const total = subtotal + tax + shipping - discount;

    // Create order
    const order = await orderService.createOrder(checkoutData, orderItems, {
      subtotal,
      discount,
      shipping,
      tax,
      total,
    });

    // Clear cart after successful order
    const cart = await cartService.getOrCreateCart(user?.id);
    await cartService.clearCart(cart.id);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        total: order.total_amount,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}