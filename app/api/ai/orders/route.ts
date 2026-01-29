import { NextResponse } from "next/server"
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  // 🔐 AI AUTH
  const aiKey = req.headers.get("x-ai-key")
  if (aiKey !== process.env.AI_SECRET_KEY) {
    return NextResponse.json(
      { error: "Unauthorized AI access" },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get("order_id")

  if (!orderId) {
    return NextResponse.json(
      { error: "order_id missing" },
      { status: 400 }
    )
  }

  // 🔍 SUPABASE QUERY
  const { data, error } = await createServerSupabaseClient
    .from("orders")
    .select(`
      id,
      status,
      awb,
      courier,
      created_at,
      customer_phone
    `)
    .eq("id", orderId)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    order: {
      id: data.id,
      status: data.status,
      awb: data.awb,
      courier: data.courier,
      created_at: data.created_at
    }
  })
}
