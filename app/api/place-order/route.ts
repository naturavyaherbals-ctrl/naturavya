import { NextResponse } from "next/server"
import { createClient } from "@/app/lib/supabase/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { cartItems, shippingDetails, paymentMethod, total } = body

  const supabase = await createClient()

  // 1. Determine Status based on Payment Method
  const status = paymentMethod === 'cod' ? 'pending_verification' : 'confirmed'
  const paymentStatus = paymentMethod === 'cod' ? 'unpaid' : 'paid'

  // 2. Insert Order into Supabase
  // (Ensure you have an 'orders' table. If not, this might fail, but let's assume standard setup)
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
      email: shippingDetails.email, // Make sure to ask for email in form
      phone: shippingDetails.phone,
      address: JSON.stringify(shippingDetails),
      items: JSON.stringify(cartItems),
      total_amount: total,
      payment_method: paymentMethod,
      status: status,
      payment_status: paymentStatus
    })
    .select()
    .single()

  if (error) {
    console.error("Order Save Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // 3. SEND EMAIL LOGIC (Mock)
  console.log(`Sending email to ${shippingDetails.email}...`)
  if (paymentMethod === 'cod') {
    console.log("Email Subject: Order Received - Waiting for Confirmation")
  } else {
    console.log("Email Subject: Order Confirmed! We are shipping it soon.")
  }

  // 4. ShipMojo Integration (Placeholder)
  // Usually, you push data to shipping partner via their API here
  // await axios.post('https://shipmojo.com/api/orders', { ...orderData })

  return NextResponse.json({ success: true, orderId: order?.id })
}