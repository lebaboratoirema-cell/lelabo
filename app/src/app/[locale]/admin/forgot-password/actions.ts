'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string

  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = host?.startsWith('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?next=/fr/admin/reset-password`,
  })

  // Always redirect to the same "sent" state — do not reveal whether the email exists.
  redirect('/fr/admin/forgot-password?sent=1')
}
