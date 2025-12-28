"use server"
import { supabaseServer } from "@/lib/supabase"

export async function addReview(formData: FormData) {
  const supabase = supabaseServer()
  
  await supabase.from("reviews").insert([{
    name: formData.get("name"),
    rating: Number(formData.get("rating")),
    comment: formData.get("comment"),
  }])
}
