"use server"
import { supabaseServer } from "@/lib/supabase"

export async function addProduct(formData: FormData) {
  const supabase = await supabaseServer()
  
  await supabase.from("products").insert([{
    name: formData.get("name"),
    price: Number(formData.get("price")),
    description: formData.get("description"),
  }])
}
