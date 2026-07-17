import { createClient } from './server'
import type { BlogPost, Category, Product, ProductImage, ProductWithVariants } from '@/types/database'

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
  chimie: 'chemicals',
  verrerie: 'glassware',
  equipements: 'lab-equipment',
  'petit-outillage': 'petit-outillage',
}

export type SearchResult = ProductWithImage & { basePath: string }

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
