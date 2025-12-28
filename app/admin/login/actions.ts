"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAdmin() {
  const cookieStore = await cookies()

  cookieStore.set("admin_token", "true", {
    path: "/",          // 🔥 REQUIRED
    httpOnly: true,
    sameSite: "lax",
  })

  redirect("/admin")    // 🔥 MUST be /admin
}
