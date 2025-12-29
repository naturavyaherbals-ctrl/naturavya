"use server"
import { supabaseServer } from "@/lib/supabase"

export async function addTestimonial(formData: FormData) {
  const supabase = await supabaseServer()
  
  await supabase.from("testimonials").insert([{
    name: formData.get("name"),
    content: formData.get("content"),
  }])
}
