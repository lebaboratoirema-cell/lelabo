import { createServiceClient } from '@/lib/supabase/service'
import ProductForm from '../_components/ProductForm'
import type { Category } from '@/types/database'

export default async function NewProductPage() {
  const supabase = createServiceClient()
  const { data: allCats } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('position')

  const parents = (allCats ?? []).filter((c) => !c.parent_id) as Category[]
  const childCategories = (allCats ?? []).filter((c) => c.parent_id) as Category[]

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Nouveau produit</h1>
      <ProductForm parents={parents} childCategories={childCategories} />
    </div>
  )
}
