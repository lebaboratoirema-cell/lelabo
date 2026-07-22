import { createServiceClient } from '@/lib/supabase/service'
import type { Category, Order, OrderStatus } from '@/types/database'

export interface RecentOrder {
  id: string
  reference: string
  customerName: string
  date: string
  total: number
  status: OrderStatus
}

export interface SubcategoryCount {
  slug: string
  name: string
  activeProducts: number
}

export interface FamilyCatalogue {
  slug: string
  name: string
  activeProducts: number
  subcategoryCount: number
  emptySubcategoryCount: number
  subcategories: SubcategoryCount[]
}

export interface DevisStats {
  total: number
  nouveaux: number
}

export interface DevisRecord {
  id: string
  name: string
  email: string
  phone: string
  product: string
  variant: string
  message: string
  status: string
  date: string
}

export interface DashboardData {
  recentOrders: RecentOrder[]
  catalogue: FamilyCatalogue[]
  devis: DevisStats
  devisList: DevisRecord[]
}

type AirtableDevisFields = {
  Nom?: string
  Email?: string
  Telephone?: string
  Produit?: string
  Variante?: string
  Message?: string
  Statut?: string
  Date?: string
}

async function fetchAllDevis(): Promise<{ id: string; fields: AirtableDevisFields }[]> {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_DEVIS_TABLE } = process.env
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_DEVIS_TABLE) return []

  try {
    const records: { id: string; fields: AirtableDevisFields }[] = []
    let offset: string | undefined

    do {
      const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_DEVIS_TABLE)}`)
      url.searchParams.set('pageSize', '100')
      if (offset) url.searchParams.set('offset', offset)

      const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } })
      if (!res.ok) break

      const page = (await res.json()) as { records: { id: string; fields: AirtableDevisFields }[]; offset?: string }
      records.push(...page.records)
      offset = page.offset
    } while (offset)

    return records
  } catch {
    return []
  }
}

async function fetchAllRows<T>(
  supabase: ReturnType<typeof createServiceClient>,
  table: string,
  columns: string
): Promise<T[]> {
  const rows: T[] = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data } = await supabase.from(table).select(columns).range(from, from + pageSize - 1)
    if (!data || data.length === 0) break
    rows.push(...(data as T[]))
    if (data.length < pageSize) break
  }
  return rows
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = createServiceClient()

  const [categories, products, { data: orders }, devisRecords] = await Promise.all([
    fetchAllRows<Category>(supabase, 'categories', 'id, slug, name, parent_id, is_active'),
    fetchAllRows<{ id: string; category_id: string; is_active: boolean }>(supabase, 'products', 'id, category_id, is_active'),
    supabase
      .from('orders')
      .select('id, reference, customer_name, status, payment_status, total, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    fetchAllDevis(),
  ])

  const devisList: DevisRecord[] = devisRecords
    .map((r) => ({
      id: r.id,
      name: r.fields.Nom ?? '—',
      email: r.fields.Email ?? '—',
      phone: r.fields.Telephone ?? '—',
      product: r.fields.Produit ?? '—',
      variant: r.fields.Variante ?? '',
      message: r.fields.Message ?? '',
      status: r.fields.Statut ?? 'Nouveau',
      date: r.fields.Date ?? '',
    }))
    .sort((a, b) => (b.date > a.date ? 1 : -1))

  const devis: DevisStats = {
    total: devisList.length,
    nouveaux: devisList.filter((d) => d.status === 'Nouveau').length,
  }

  const recentOrders: RecentOrder[] = ((orders ?? []) as Order[]).map((o) => ({
    id: o.id,
    reference: o.reference,
    customerName: o.customer_name,
    date: new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
    total: o.total,
    status: o.status,
  }))

  const activeCountByCategory = new Map<string, number>()
  for (const p of products) {
    if (!p.is_active) continue
    activeCountByCategory.set(p.category_id, (activeCountByCategory.get(p.category_id) ?? 0) + 1)
  }
  const childrenByParent = new Map<string, Category[]>()
  for (const c of categories) {
    if (c.parent_id) {
      const arr = childrenByParent.get(c.parent_id) ?? []
      arr.push(c)
      childrenByParent.set(c.parent_id, arr)
    }
  }
  const roots = categories.filter((c) => !c.parent_id && c.is_active)
  const catalogue: FamilyCatalogue[] = roots.map((root) => {
    const children = childrenByParent.get(root.id) ?? []
    let total = activeCountByCategory.get(root.id) ?? 0
    let emptyCount = 0
    const subcategories: SubcategoryCount[] = children
      .map((child) => {
        const c = activeCountByCategory.get(child.id) ?? 0
        total += c
        if (c === 0) emptyCount++
        return { slug: child.slug, name: child.name?.fr ?? child.slug, activeProducts: c }
      })
      .sort((a, b) => b.activeProducts - a.activeProducts || a.name.localeCompare(b.name))
    return {
      slug: root.slug,
      name: root.name?.fr ?? root.slug,
      activeProducts: total,
      subcategoryCount: children.length,
      emptySubcategoryCount: emptyCount,
      subcategories,
    }
  })

  return { recentOrders, catalogue, devis, devisList }
}
