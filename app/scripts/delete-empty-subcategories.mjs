// Deletes subcategories that have zero products (active or inactive).
// Run: node --env-file=.env.local scripts/delete-empty-subcategories.mjs
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SLUGS = [
  'acides', 'reactifs', 'enzyme-substrates', 'biomolecules', 'antibodies',
  'enzyme-inhibitors', 'cell-solutions', 'amino-acids',
  'verreries', 'consommable', 'becher', 'ampoule-a-decanter', 'ballon',
  'entonnoirs', 'eprouvette', 'fiole', 'pipettes-verre-graduees',
  'tubes-essai-centrifugation', 'burette', 'bouchon', 'cuve-spectrophotometre',
  'plastique', 'rheometers',
]

async function fetchAll(table, columns) {
  const rows = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + pageSize - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < pageSize) break
  }
  return rows
}

const categories = await fetchAll('categories', 'id, slug, parent_id')
const products = await fetchAll('products', 'id, category_id')

const productCountByCategory = new Map()
for (const p of products) {
  productCountByCategory.set(p.category_id, (productCountByCategory.get(p.category_id) ?? 0) + 1)
}

const targets = categories.filter((c) => SLUGS.includes(c.slug) && c.parent_id)

const notFound = SLUGS.filter((s) => !targets.some((t) => t.slug === s))
if (notFound.length) console.log('NOT FOUND (skipped):', notFound.join(', '))

const blocked = targets.filter((t) => (productCountByCategory.get(t.id) ?? 0) > 0)
if (blocked.length) {
  console.log('BLOCKED (has products, not deleting):', blocked.map((b) => b.slug).join(', '))
}

const toDelete = targets.filter((t) => (productCountByCategory.get(t.id) ?? 0) === 0)

for (const cat of toDelete) {
  const { error } = await supabase.from('categories').delete().eq('id', cat.id)
  if (error) {
    console.log(`FAILED: ${cat.slug} - ${error.message}`)
  } else {
    console.log(`DELETED: ${cat.slug}`)
  }
}
