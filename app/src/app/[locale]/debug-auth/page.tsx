// TEMPORARY diagnostic page — remove after the admin-login production bug is fixed.
// Shows the current session's auth state directly in the browser (no server log access needed).
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DebugAuthPage() {
  const cookieStore = await cookies()
  const cookieNames = cookieStore.getAll().map((c) => c.name)

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  return (
    <pre style={{ padding: 24, fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          cookieNames,
          getUserError: error ? { message: error.message, status: error.status } : null,
          user: user
            ? {
                id: user.id,
                email: user.email,
                app_metadata: user.app_metadata,
                aud: user.aud,
                role: user.role,
              }
            : null,
        },
        null,
        2
      )}
    </pre>
  )
}
