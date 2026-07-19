// One-off: merge all products from the 11 remaining humeau batch-1 glassware
// categories (becher, ampoule-a-decanter, ballon, entonnoirs, eprouvette,
// fiole, pipettes-verre-graduees, tubes-essai-centrifugation, burette,
// bouchon, cuve-spectrophotometre — 165 products, no slug collisions) into
// the single existing petit-outillage/outillage-verrerie category.
// Run: node --env-file=.env.local scripts/merge-glassware-into-outillage-verrerie.mjs [--dry-run]

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const DRY_RUN = process.argv.includes('--dry-run')

const SOURCE_SLUGS = [
  'becher', 'ampoule-a-decanter', 'ballon', 'entonnoirs', 'eprouvette', 'fiole',
  'pipettes-verre-graduees', 'tubes-essai-centrifugation', 'burette', 'bouchon',
  'cuve-spectrophotometre',
]

const { data: target, error: targetErr } = await supabase
  .from('categories')
  .select('id')
  .eq('slug', 'outillage-verrerie')
  .single()
if (targetErr) throw targetErr

const { data: sourceCats, error: srcErr } = await supabase
  .from('categories')
  .select('id, slug')
  .in('slug', SOURCE_SLUGS)
if (srcErr) throw srcErr

const { data: products, error: prodErr } = await supabase
  .from('products')
  .select('id, slug, category_id')
  .in('category_id', sourceCats.map((c) => c.id))
if (prodErr) throw prodErr

console.log(`${products.length} products to move into outillage-verrerie.`)

if (DRY_RUN) {
  console.log('Dry run — would move:', products.map((p) => p.slug))
  process.exit(0)
}

const { data: updated, error: updErr } = await supabase
  .from('products')
  .update({ category_id: target.id })
  .in('id', products.map((p) => p.id))
  .select('slug')
if (updErr) throw updErr

console.log(`Moved ${updated.length} products into outillage-verrerie.`)
