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
    <>
      <ProductForm parents={parents} childCategories={childCategories} />
    </>
  )
}
