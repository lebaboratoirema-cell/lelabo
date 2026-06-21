import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import ProductForm from '../../_components/ProductForm'
import type { Category, Product, ProductVariant, ProductImage } from '@/types/database'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()

  const [{ data: product }, { data: variants }, { data: allCats }, { data: images }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('product_variants').select('*').eq('product_id', id).order('position'),
    supabase.from('categories').select('*').eq('is_active', true).order('position'),
    supabase.from('product_images').select('*').eq('product_id', id).order('position'),
  ])

  if (!product) notFound()

  const parents = (allCats ?? []).filter((c) => !c.parent_id) as Category[]
  const childCategories = (allCats ?? []).filter((c) => c.parent_id) as Category[]

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Modifier le produit</h1>
      <ProductForm
        parents={parents}
        childCategories={childCategories}
        product={product as Product}
        variants={(variants ?? []) as ProductVariant[]}
        images={(images ?? []) as ProductImage[]}
      />
    </div>
  )
}
