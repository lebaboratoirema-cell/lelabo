// One-off: VIS1002 (Anton Paar Lovis 2001 microviscometer) imported at 0 MAD
// (source price_gbp: "0.00", "price on application" item, same issue as
// density-meters and rheometers). Deactivate until real pricing is available.
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data, error } = await supabase
  .from('products')
  .update({ is_active: false })
  .eq('slug', 'microviscosimetre-bille-roulante-anton-paar-lovis-2001-benchtop')
  .select('slug')

if (error) throw error
console.log(`Deactivated ${data.length} product(s):`, data.map((p) => p.slug))
