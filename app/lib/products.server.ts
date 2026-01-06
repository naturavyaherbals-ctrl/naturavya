import { createClient } from "./supabase/server"

// 1. Existing function (kept as is)
export async function getProductsByCategory(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_slug", slug)

  if (error) throw error
  return data
}

// 2. New function (Added this to fix the error)
export async function getAllProducts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order('created_at', { ascending: false }) // Optional: sorts by newest

  if (error) throw error
  return data
}