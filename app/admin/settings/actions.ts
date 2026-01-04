"use server"

import { supabaseServer } from "@/app/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateSettings(formData: FormData) {
  const supabase = await supabaseServer()
  
  // 1. Get all the values from the form
  const settingsToUpdate = [
    { key: "store_name", value: formData.get("store_name") },
    { key: "support_email", value: formData.get("support_email") },
    { key: "phone", value: formData.get("phone") },
    { key: "address", value: formData.get("address") },
    { key: "instagram", value: formData.get("instagram") },
    { key: "facebook", value: formData.get("facebook") },
  ]

  // 2. Loop through and save each one to the database
  for (const setting of settingsToUpdate) {
    if (setting.value !== null) {
      await supabase
        .from("settings")
        .upsert({ key: setting.key, value: setting.value as string }, { onConflict: "key" })
    }
  }

  // 3. Refresh the pages so the new data shows up immediately
  revalidatePath("/admin/settings")
  revalidatePath("/") // Updates the footer on the homepage
  
  // 4. Stay on the page (or you can redirect)
  return { message: "Settings Saved!" }
}