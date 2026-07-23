import { createClient } from './server'
import type { BlogPost, Category, LocalizedText, Product, ProductImage, ProductWithVariants } from '@/types/database'

export type { ProductWithVariants }

export type ProductWithImage = Product & {
  product_images: Pick<ProductImage, 'storage_path' | 'is_primary'>[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data ?? null
}

export async function getChildCategories(parentId: string): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .order('position')
  return data ?? []
}

export interface CategoryGroup {
  groupKey: string
  groupLabel: LocalizedText
  categories: Category[]
}

export async function getChildCategoriesGrouped(parentId: string): Promise<CategoryGroup[]> {
  const children = await getChildCategories(parentId)

  const groups = new Map<string, CategoryGroup>()
  const others: Category[] = []

  for (const category of children) {
    if (!category.group_key) {
      others.push(category)
      continue
    }
    const existing = groups.get(category.group_key)
    if (existing) {
      existing.categories.push(category)
    } else {
      groups.set(category.group_key, {
        groupKey: category.group_key,
        groupLabel: category.group_label ?? { fr: category.group_key },
        categories: [category],
      })
    }
  }

  const result = [...groups.values()]
  if (others.length > 0) {
    result.push({ groupKey: '__others__', groupLabel: { fr: 'Autres' }, categories: others })
  }
  return result
}

export async function getProductsByCategory(categoryId: string): Promise<ProductWithImage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(storage_path, is_primary)')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return (data as ProductWithImage[]) ?? []
}

export async function getProductsByFamily(parentId: string): Promise<ProductWithImage[]> {
  const supabase = await createClient()

  const { data: children } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', parentId)
    .eq('is_active', true)

  const categoryIds = [parentId, ...(children ?? []).map((c) => c.id)]

  const { data } = await supabase
    .from('products')
    .select('*, product_images(storage_path, is_primary)')
    .in('category_id', categoryIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (data as ProductWithImage[]) ?? []
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_variants(*), product_images(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .order('position', { referencedTable: 'product_variants', ascending: true })
    .order('position', { referencedTable: 'product_images', ascending: true })
    .maybeSingle()
  return (data as ProductWithVariants | null) ?? null
}

const FAMILY_ROUTE_BY_SLUG: Record<string, string> = {
  chimie: 'produits-chimiques',
  equipements: 'lab-equipment',
  'petit-outillage': 'petit-outillage',
}

export type SearchResult = ProductWithImage & { basePath: string }

function resolveBasePath(
  category: { slug: string; parent_id: string | null } | null,
  rootSlugById: Map<string, string>
): string {
  if (!category) return '/fr'
  if (category.parent_id) {
    const rootSlug = rootSlugById.get(category.parent_id)
    const route = rootSlug ? FAMILY_ROUTE_BY_SLUG[rootSlug] : undefined
    return route ? `/fr/${route}/${category.slug}` : '/fr'
  }
  const route = FAMILY_ROUTE_BY_SLUG[category.slug]
  return route ? `/fr/${route}` : '/fr'
}

export async function getFeaturedProducts(limit = 15): Promise<SearchResult[]> {
  const supabase = await createClient()

  const [{ data: manual }, { data: roots }] = await Promise.all([
    supabase
      .from('products')
      .select('*, product_images(storage_path, is_primary), category:categories(slug, parent_id)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('featured_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase.from('categories').select('id, slug').is('parent_id', null),
  ])

  const rootSlugById = new Map((roots ?? []).map((r) => [r.id, r.slug]))

  if (manual && manual.length > 0) {
    return (manual as Array<ProductWithImage & { category: { slug: string; parent_id: string | null } | null }>).map(
      ({ category, ...p }) => ({ ...p, basePath: resolveBasePath(category, rootSlugById) })
    )
  }

  return getAutoFeaturedProducts(limit, rootSlugById)
}

async function getAutoFeaturedProducts(limit: number, rootSlugById: Map<string, string>): Promise<SearchResult[]> {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, product_images(storage_path, is_primary), product_variants(price), category:categories(id, slug, parent_id)')
    .eq('is_active', true)

  const maxPrice = (p: { product_variants?: { price: number }[] }) =>
    Math.max(0, ...(p.product_variants ?? []).map((v) => v.price))

  type ProductRow = ProductWithImage & {
    product_variants: { price: number }[]
    category: { id: string; slug: string; parent_id: string | null } | null
  }

  const byRoot = new Map<string, ProductRow[]>()
  for (const p of (products ?? []) as ProductRow[]) {
    const rootId = p.category?.parent_id ?? p.category?.id ?? 'uncategorized'
    const group = byRoot.get(rootId) ?? []
    group.push(p)
    byRoot.set(rootId, group)
  }
  for (const group of byRoot.values()) {
    group.sort((a, b) => maxPrice(b) - maxPrice(a))
  }

  const groups = [...byRoot.values()]
  const topProducts: ProductRow[] = []
  for (let i = 0; topProducts.length < limit && groups.some((g) => g.length > i); i++) {
    for (const group of groups) {
      if (group[i]) topProducts.push(group[i])
      if (topProducts.length >= limit) break
    }
  }

  return topProducts.map(({ category, ...p }) => ({ ...p, basePath: resolveBasePath(category, rootSlugById) }))
}

export async function searchProducts(query: string): Promise<SearchResult[]> {
  const supabase = await createClient()
  const term = `%${query.replace(/[,()%]/g, ' ').trim()}%`

  const [{ data: products }, { data: roots }] = await Promise.all([
    supabase
      .from('products')
      .select('*, product_images(storage_path, is_primary), category:categories(slug, parent_id)')
      .or(`name->>fr.ilike.${term},brand.ilike.${term}`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(60),
    supabase.from('categories').select('id, slug').is('parent_id', null),
  ])

  const rootSlugById = new Map((roots ?? []).map((r) => [r.id, r.slug]))

  return ((products ?? []) as Array<ProductWithImage & { category: { slug: string; parent_id: string | null } | null }>).map(
    ({ category, ...p }) => {
      let basePath = '/fr'
      if (category) {
        if (category.parent_id) {
          const rootSlug = rootSlugById.get(category.parent_id)
          const route = rootSlug ? FAMILY_ROUTE_BY_SLUG[rootSlug] : undefined
          basePath = route ? `/fr/${route}/${category.slug}` : '/fr'
        } else {
          const route = FAMILY_ROUTE_BY_SLUG[category.slug]
          basePath = route ? `/fr/${route}` : '/fr'
        }
      }
      return { ...p, basePath }
    }
  )
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
  return (data as BlogPost[]) ?? []
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
  return (data as BlogPost | null) ?? null
}

export async function getAllProductsForSitemap(): Promise<{ slug: string; basePath: string }[]> {
  const supabase = await createClient()

  const [{ data: products }, { data: roots }] = await Promise.all([
    supabase
      .from('products')
      .select('slug, category:categories(slug, parent_id)')
      .eq('is_active', true),
    supabase.from('categories').select('id, slug').is('parent_id', null),
  ])

  const rootSlugById = new Map((roots ?? []).map((r) => [r.id, r.slug]))

  return (
    (products ?? []) as unknown as Array<{ slug: string; category: { slug: string; parent_id: string | null } | null }>
  )
    .map(({ slug, category }) => ({ slug, basePath: resolveBasePath(category, rootSlugById) }))
    .filter((p) => p.basePath !== '/fr')
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 3,
): Promise<ProductWithImage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(storage_path, is_primary)')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', excludeId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as ProductWithImage[]) ?? []
}
