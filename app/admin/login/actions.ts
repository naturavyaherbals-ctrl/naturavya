"use server"

import { supabaseServer } from "@/app/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  const supabase = await supabaseServer()

  // 1. Check database for matching email & password
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .eq("password", password) 
    .single()

  if (data) {
    // 2. Success! Set the cookie securely
    const cookieStore = await cookies()
    cookieStore.set("admin-auth", "true", { path: "/" })
    
    // 3. Redirect to dashboard
    redirect("/admin")
  } else {
    // 4. Failed
    return { error: "Invalid email or password" }
  }
}
