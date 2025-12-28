import { createServerSupabase } from "@/lib/supabase/server"

export async function getAllProducts() {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  return data || []
}

export async function getProductBySlug(slug: string) {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single()

  return data
}

export async function getProductsByCategory(slug: string) {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("category_slug", slug)

  return data || []
}
