import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Authentication alone is not authorization — must also hold app_metadata.role === 'admin'.
// app_metadata is only settable via the Supabase service role / admin API, never by the user.
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/403')
  }

  return user
}
