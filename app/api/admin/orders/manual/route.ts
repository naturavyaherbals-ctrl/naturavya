import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const body = await request.json();

    console.log('📦 Manual order request:', body);

    // Basic Validation
    if (!body.customerName || !body.customerPhone || !body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate Order Number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // Prepare Order Data
    const orderData = {
      order_number: orderNumber,
      customer_name: body.customerName,
      customer_email: body.customerEmail,
      customer_phone: body.customerPhone,
      
      shipping_address: body.shippingAddress,
      billing_address: body.billingAddress || body.shippingAddress,
      
      items: body.items.map((item: any) => ({
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.quantity * item.price,
        sku: item.sku || ''
      })),
      
      subtotal: body.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
      shipping_cost: body.shippingCost || 0,
      discount: body.discount || 0,
      tax: body.tax || 0,
      total: 0, // Calculated below
      
      payment_method: body.paymentMethod,
      payment_status: body.paymentMethod === 'prepaid' ? 'paid' : 'pending',
      current_status: 'confirmed',
      status_updated_at: new Date().toISOString(),
      
      created_at: new Date().toISOString()
    };

    // Calculate Final Total
    orderData.total = orderData.subtotal + orderData.shipping_cost + orderData.tax - orderData.discount;

    // Insert into Database
    const { data: newOrder, error } = await adminClient
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add initial status history
    await adminClient.from('order_status_history').insert({
      order_id: newOrder.id,
      new_status: 'confirmed',
      notes: 'Manual order created by admin',
      updated_by_role: 'admin'
    });

    return NextResponse.json({ success: true, orderNumber });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}