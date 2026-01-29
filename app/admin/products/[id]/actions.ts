"use server"

import { supabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function updateProduct(id: string, data: any) {
  const supabase = supabaseServer()

  await supabase.from("products").update(data).eq("id", id)
}

export async function deleteProduct(id: string) {
  const supabase = supabaseServer()

  await supabase.from("products").delete().eq("id", id)
  redirect("/admin/products")
}
