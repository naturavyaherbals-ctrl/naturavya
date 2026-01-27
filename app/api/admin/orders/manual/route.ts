import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server'; // 👈 Needed to identify agent

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const adminClient = createAdminClient();
    
    // 1. Get the Logged-in User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get the Agent's Team Member ID
    const { data: member } = await supabase
      .from('team_members')
      .select('id, name, role')
      .eq('user_id', user.id)
      .single();

    const body = await request.json();

    // 3. Basic Validation
    if (!body.customerName || !body.customerPhone || !body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // 4. Prepare Order Data (Including Assignment)
    const orderData = {
      order_number: orderNumber,
      customer_name: body.customerName,
      customer_email: body.customerEmail,
      customer_phone: body.customerPhone,
      shipping_address: body.shippingAddress,
      billing_address: body.billingAddress || body.shippingAddress,
      
      // 👇 THE CRITICAL FIX: Assign order to the agent who created it
      assigned_to: member?.id || null, 
      
      items: body.items,
      subtotal: body.items.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || item.qty)), 0),
      shipping_cost: body.shippingCost || 0,
      discount: body.discount || 0,
      tax: body.tax || 0,
      total: 0,
      
      payment_method: body.paymentMethod,
      payment_status: body.paymentMethod === 'prepaid' ? 'paid' : 'pending',
      current_status: 'confirmed',
      status_updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    orderData.total = orderData.subtotal + orderData.shipping_cost + orderData.tax - orderData.discount;

    // 5. Insert into Database
    const { data: newOrder, error } = await adminClient
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 6. Add initial status history
    await adminClient.from('order_status_history').insert({
      order_id: newOrder.id,
      new_status: 'confirmed',
      notes: 'Manual order created by ' + (member?.name || 'Admin'),
      updated_by_name: member?.name || 'Admin',
      updated_by_role: member?.role || 'admin'
    });

    return NextResponse.json({ success: true, orderNumber });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server'; // 👈 Needed to identify agent

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const adminClient = createAdminClient();
    
    // 1. Get the Logged-in User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get the Agent's Team Member ID
    const { data: member } = await supabase
      .from('team_members')
      .select('id, name, role')
      .eq('user_id', user.id)
      .single();

    const body = await request.json();

    // 3. Basic Validation
    if (!body.customerName || !body.customerPhone || !body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // 4. Prepare Order Data (Including Assignment)
    const orderData = {
      order_number: orderNumber,
      customer_name: body.customerName,
      customer_email: body.customerEmail,
      customer_phone: body.customerPhone,
      shipping_address: body.shippingAddress,
      billing_address: body.billingAddress || body.shippingAddress,
      
      // 👇 THE CRITICAL FIX: Assign order to the agent who created it
      assigned_to: member?.id || null, 
      
      items: body.items,
      subtotal: body.items.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || item.qty)), 0),
      shipping_cost: body.shippingCost || 0,
      discount: body.discount || 0,
      tax: body.tax || 0,
      total: 0,
      
      payment_method: body.paymentMethod,
      payment_status: body.paymentMethod === 'prepaid' ? 'paid' : 'pending',
      current_status: 'confirmed',
      status_updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    orderData.total = orderData.subtotal + orderData.shipping_cost + orderData.tax - orderData.discount;

    // 5. Insert into Database
    const { data: newOrder, error } = await adminClient
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 6. Add initial status history
    await adminClient.from('order_status_history').insert({
      order_id: newOrder.id,
      new_status: 'confirmed',
      notes: 'Manual order created by ' + (member?.name || 'Admin'),
      updated_by_name: member?.name || 'Admin',
      updated_by_role: member?.role || 'admin'
    });

    return NextResponse.json({ success: true, orderNumber });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}