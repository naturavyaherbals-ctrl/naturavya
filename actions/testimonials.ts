"use server"
import { supabase } from "@/lib/supabase"

export async function addTestimonial(formData: FormData) {
  await supabase.from("testimonials").insert([{
    name: formData.get("name"),
    content: formData.get("content"),
  }])
}
