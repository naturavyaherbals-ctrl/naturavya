'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string

  // 1. Update Auth Metadata (for the name)
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: fullName }
  })

  if (authError) {
    return { error: authError.message }
  }

  // 2. Update 'users' table (Optional: if you store extra data like phone there)
  // If you don't have a 'users' table yet, you can skip this part or create one.
  /*
  const { error: dbError } = await supabase
    .from('users')
    .update({ phone: phone })
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
  */

  revalidatePath('/account')
  redirect('/account')
}

