import { createServiceClient } from '@/lib/supabase/service'
import CategoryForm from '../_components/CategoryForm'
import type { Category } from '@/types/database'

export default async function NewCategoryPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .order('position')

  const categories = (data ?? []) as Pick<Category, 'id' | 'name'>[]

  return <CategoryForm categories={categories as Category[]} />
}
