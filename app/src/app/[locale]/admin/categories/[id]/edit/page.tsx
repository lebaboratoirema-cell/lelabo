import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import CategoryForm from '../../_components/CategoryForm'
import type { Category } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()

  const [{ data: category }, { data: allCategories }] = await Promise.all([
    supabase.from('categories').select('*').eq('id', id).single(),
    supabase.from('categories').select('id, name').order('position'),
  ])

  if (!category) notFound()

  // Exclude self from parent options to prevent circular references
  const parentOptions = ((allCategories ?? []) as Category[]).filter((c) => c.id !== id)

  return <CategoryForm categories={parentOptions} category={category as Category} />
}
