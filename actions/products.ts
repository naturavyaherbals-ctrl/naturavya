"use server"
import { supabase } from "@/lib/supabase"

export async function addProduct(formData: FormData) {
  await supabase.from("products").insert([{
    name: formData.get("name"),
    price: Number(formData.get("price")),
    description: formData.get("description"),
  }])
}
