import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const cookieStore = await cookies()
  
  // Delete the admin auth cookie
  cookieStore.delete("admin-auth")
  
  return NextResponse.json({ success: true })
}
