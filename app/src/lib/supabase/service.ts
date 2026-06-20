import { createClient } from '@supabase/supabase-js'

// Bypasses RLS — server-side admin use only, never expose to client
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
