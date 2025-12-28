"use server"
import { supabaseServer } from "@/lib/supabase"

export async function createOrder(formData: FormData) {
  const supabase = supabaseServer()
  
  await supabase.from("orders").insert([{
    customer_name: formData.get("customer_name"),
    email: formData.get("email"),
    total: Number(formData.get("total")),
  }])
}
