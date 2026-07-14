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
