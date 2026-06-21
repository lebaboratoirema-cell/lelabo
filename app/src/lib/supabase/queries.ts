import { createClient } from './server'
import type { Category, Product, ProductImage } from '@/types/database'

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
