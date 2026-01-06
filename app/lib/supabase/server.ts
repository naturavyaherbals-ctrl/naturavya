import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function createClient() {
  // Await the cookie store (required for Next.js 15+)
  const cookieStore = await cookies()

  // console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL) // You can comment this out to keep logs clean

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Use ANON key, not Service Role key
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// 👇 THIS IS THE FIX: Export the alias so Admin pages work
export const supabaseServer = createClient;
