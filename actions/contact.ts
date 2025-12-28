"use server"
import { supabase } from "@/lib/supabase"

export async function saveContact(formData: FormData) {
  await supabase.from("contacts").insert([{
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  }])
}
