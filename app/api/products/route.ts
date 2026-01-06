import { NextResponse } from "next/server"
import { createClient } from "@/app/lib/supabase/server"

export async function GET() {
  // 1. Initialize Supabase
  const supabase = await createClient()

  // 2. Fetch products (adjust 'products' if your table name is different)
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order('created_at', { ascending: false })

  // 3. Handle errors
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 4. Return data
  return NextResponse.json(products)
}