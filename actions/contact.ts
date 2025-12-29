"use server"
import { supabaseServer } from "@/lib/supabase"

export async function saveContact(formData: FormData) {
  const supabase = await supabaseServer()
  
  await supabase.from("contacts").insert([{
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  }])
}
