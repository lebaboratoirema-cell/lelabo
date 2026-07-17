// One-off: rheometer accessories imported at 0 MAD (source price_gbp: 0, "price on
// application" items, same issue hit with density-meters). Deactivate until real
// pricing is available.
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data: cat, error: catErr } = await supabase
  .from('categories')
  .select('id')
  .eq('slug', 'rheometers')
  .single()

if (catErr) throw catErr

const { data, error } = await supabase
  .from('products')
  .update({ is_active: false })
  .eq('category_id', cat.id)
  .select('slug')

if (error) throw error
console.log(`Deactivated ${data.length} products:`, data.map((p) => p.slug))
