'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // 1. Sign In
  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // 2. Fetch Role directly on the server
  let role = 'customer'
  if (authData.user) {
    const { data: member } = await supabase
      .from('team_members')
      .select('role')
      .eq('user_id', authData.user.id)
      .single()
    
    if (member?.role) {
      role = member.role.toLowerCase()
    }
  }

  revalidatePath('/', 'layout')
  
  // 3. Return success AND the role
  return { success: true, role }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
