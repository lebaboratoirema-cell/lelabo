// One-off: grant admin role via app_metadata (service-role-only, not client-editable)
// so proxy.ts / requireAdmin() authz checks pass. Run once per admin account.
import { createClient } from '@supabase/supabase-js'

const TARGET_EMAIL = 'lebaboratoire.ma@gmail.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

let user = null
let page = 1
while (!user) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
  if (error) throw error
  user = data.users.find((u) => u.email?.toLowerCase() === TARGET_EMAIL.toLowerCase())
  if (user || data.users.length < 200) break
  page++
}

if (!user) {
  throw new Error(`No Supabase auth user found with email ${TARGET_EMAIL}`)
}

const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
  app_metadata: { ...user.app_metadata, role: 'admin' },
})

if (updateError) throw updateError
console.log(`Granted role: admin to ${updated.user.email} (id: ${updated.user.id})`)
console.log('app_metadata:', updated.user.app_metadata)
