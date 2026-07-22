// Read-only check: confirm app_metadata.role for the target admin account
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
  console.log(`No user found with email ${TARGET_EMAIL}`)
} else {
  console.log(`${user.email} (id: ${user.id})`)
  console.log('app_metadata:', user.app_metadata)
  console.log(user.app_metadata?.role === 'admin' ? 'OK: role=admin set' : 'MISSING: role is not admin')
}
