import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase Admin Client (To bypass RLS if needed for inserts)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cartItems, shippingDetails, paymentMethod, paymentId, total } = body

    // 1. Prepare data for Supabase
    // We combine First/Last name and format the address
    const fullAddress = `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.pincode}`
    const fullName = `${shippingDetails.firstName} ${shippingDetails.lastName}`

    // 2. Insert into 'orders' table
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: fullName,
          customer_email: shippingDetails.email,
          phone: shippingDetails.phone,
          address: fullAddress, // Stores the full address string
          products: cartItems,  // Stores the cart array as JSON
          total_amount: total,
          payment_method: paymentMethod,
          payment_id: paymentId || null, // Razorpay ID or null for COD
          status: 'Pending',    // Default status
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase Insert Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 3. (Optional) Trigger the Email API we created earlier
    // This sends the confirmation email immediately after saving
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-order-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: data.id,
        customerName: fullName,
        customerEmail: shippingDetails.email,
        totalAmount: total,
        items: cartItems
      })
    }).catch(err => console.error("Email failed:", err)) // Don't block the order if email fails

    return NextResponse.json({ success: true, orderId: data.id })

  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}