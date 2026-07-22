'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password.length < 8) {
    redirect('/fr/admin/reset-password?error=short')
  }

  if (password !== confirmPassword) {
    redirect('/fr/admin/reset-password?error=mismatch')
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/fr/admin/forgot-password?error=expired')
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    redirect('/fr/admin/reset-password?error=1')
  }

  await supabase.auth.signOut()
  redirect('/fr/admin/login?reset=1')
}
