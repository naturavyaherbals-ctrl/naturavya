"use server"

import { supabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function createCategory(formData: FormData) {
  const supabase = supabaseServer()

  await supabase.from("categories").insert({
    name: formData.get("name"),
  })

  redirect("/admin/categories")
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = supabaseServer()

  await supabase
    .from("categories")
    .update({ name: formData.get("name") })
    .eq("id", id)

  redirect("/admin/categories")
}

export async function deleteCategory(id: string) {
  const supabase = supabaseServer()
  await supabase.from("categories").delete().eq("id", id)
}
