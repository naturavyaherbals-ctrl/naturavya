"use server"
import { supabase } from "@/lib/supabase"

export async function addReview(formData: FormData) {
  await supabase.from("reviews").insert([{
    name: formData.get("name"),
    rating: Number(formData.get("rating")),
    comment: formData.get("comment"),
  }])
}
