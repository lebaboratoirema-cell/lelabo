'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { slugify } from '@/lib/slugify'

export async function createCategory(formData: FormData) {
  const supabase = createServiceClient()
  const nameFr = formData.get('name_fr') as string
  const slug = (formData.get('slug') as string).trim() || slugify(nameFr)
  const parentId = (formData.get('parent_id') as string) || null

  const { error } = await supabase.from('categories').insert({
    name: { fr: nameFr },
    slug,
    parent_id: parentId,
    is_active: formData.get('is_active') === 'on',
    position: 0,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/fr/admin/categories')
  redirect('/fr/admin/categories')
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = createServiceClient()
  const nameFr = formData.get('name_fr') as string
  const slug = (formData.get('slug') as string).trim()
  const parentId = (formData.get('parent_id') as string) || null

  const { error } = await supabase
    .from('categories')
    .update({
      name: { fr: nameFr },
      slug,
      parent_id: parentId,
      is_active: formData.get('is_active') === 'on',
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/fr/admin/categories')
  redirect('/fr/admin/categories')
}

export async function deleteCategory(id: string) {
  const supabase = createServiceClient()

  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (count && count > 0) {
    throw new Error(
      `Cette catégorie contient ${count} produit(s). Réaffectez-les avant de supprimer.`
    )
  }

  const { count: childCount } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', id)

  if (childCount && childCount > 0) {
    throw new Error(
      `Cette catégorie a ${childCount} sous-catégorie(s). Réaffectez-les avant de supprimer.`
    )
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/fr/admin/categories')
}
