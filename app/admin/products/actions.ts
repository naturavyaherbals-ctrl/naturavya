"use server"

import { supabaseServer } from "@/app/lib/supabase/server"
import { redirect } from "next/navigation"

export async function createProduct(formData: FormData) {
  const supabase = supabaseServer()

  await supabase.from("products").insert({
    name: formData.get("name"),
    price: Number(formData.get("price")),
  })

  redirect("/admin/products")
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = supabaseServer()

  await supabase
    .from("products")
    .update({
      name: formData.get("name"),
      price: Number(formData.get("price")),
    })
    .eq("id", id)

  redirect("/admin/products")
}

export async function deleteProduct(id: string) {
  const supabase = supabaseServer()
  await supabase.from("products").delete().eq("id", id)
}
