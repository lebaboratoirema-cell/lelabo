// Lists categories/subcategories with zero active products.
// Run: node --env-file=.env.local scripts/list-empty-categories.mjs
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

const categories = await fetchAll('categories', 'id, slug, name, parent_id, is_active')
const products = await fetchAll('products', 'id, category_id, is_active')

const activeCountByCategory = new Map()
for (const p of products) {
  if (!p.is_active) continue
  activeCountByCategory.set(p.category_id, (activeCountByCategory.get(p.category_id) ?? 0) + 1)
}

const childrenByParent = new Map()
for (const c of categories) {
  if (c.parent_id) {
    const arr = childrenByParent.get(c.parent_id) ?? []
    arr.push(c)
    childrenByParent.set(c.parent_id, arr)
  }
}

const roots = categories.filter((c) => !c.parent_id)

for (const root of roots) {
  const rootCount = activeCountByCategory.get(root.id) ?? 0
  const rootLabel = `${root.slug}${root.is_active ? '' : ' [INACTIVE]'}`
  if (rootCount === 0) console.log(`EMPTY CATEGORY: ${rootLabel} (0 active products)`)

  const children = childrenByParent.get(root.id) ?? []
  for (const child of children) {
    const count = activeCountByCategory.get(child.id) ?? 0
    if (count === 0) {
      const childLabel = `${child.slug}${child.is_active ? '' : ' [INACTIVE]'}`
      console.log(`EMPTY SUBCATEGORY: ${rootLabel} > ${childLabel} (0 active products)`)
    }
  }
}
