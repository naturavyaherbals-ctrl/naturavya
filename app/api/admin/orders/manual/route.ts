import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const adminClient = createAdminClient();
    
    // 1. Identify the logged-in agent
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch the Team Member record for this user
    const { data: member } = await supabase
      .from('team_members')
      .select('id, name, role')
      .eq('user_id', user.id)
      .single();

    const body = await request.json();

    // 3. Basic Validation
    if (!body.customerName || !body.customerPhone || !body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields (Name, Phone, Items)' }, { status: 400 });
    }

    // 4. Generate unique order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // 5. Calculate totals
    const subtotal = body.items.reduce((sum: number, item: any) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity || item.qty) || 0;
      return sum + (price * qty);
    }, 0);
    
    const shippingCost = parseFloat(body.shippingCost) || 0;
    const discount = parseFloat(body.discount) || 0;
    const tax = parseFloat(body.tax) || 0;
    const total = subtotal + shippingCost + tax - discount;

    // 6. Prepare Order Data
    const orderData = {
      order_number: orderNumber,
      customer_name: body.customerName,
      customer_email: body.customerEmail || null,
      customer_phone: body.customerPhone,
      shipping_address: body.shippingAddress,
      billing_address: body.billingAddress || body.shippingAddress,
      
      // Assign the order to the agent who created it
      assigned_to: member?.id || null, 
      
      items: body.items,
      subtotal: subtotal,
      shipping_cost: shippingCost,
      tax: tax,
      discount: discount,
      total: total,
      
      payment_method: body.paymentMethod || 'cod',
      payment_status: body.paymentMethod === 'prepaid' ? 'paid' : 'pending',
      current_status: 'confirmed',
      status_updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    // 7. Insert into Supabase
    const { data: newOrder, error: insertError } = await adminClient
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Database error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 8. Log initial status history
    await adminClient.from('order_status_history').insert({
      order_id: newOrder.id,
      new_status: 'confirmed',
      notes: 'Manual order created by ' + (member?.name || 'Admin'),
      updated_by_name: member?.name || 'Admin',
      updated_by_role: member?.role || 'admin'
    });

    return NextResponse.json({ 
      success: true, 
      orderNumber: orderNumber,
      orderId: newOrder.id 
    });

  } catch (error: any) {
    console.error('API Crash:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}