'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'

export async function updateFeaturedProducts(formData: FormData) {
  const supabase = createServiceClient()
  const ids = formData.getAll('product_id') as string[]

  await Promise.all(
    ids.map((id) => {
      const featured = formData.get(`featured_${id}`) === 'on'
      const positionRaw = formData.get(`position_${id}`) as string
      const position = positionRaw ? parseInt(positionRaw, 10) : null

      return supabase
        .from('products')
        .update({
          is_featured: featured,
          featured_position: featured && position && !isNaN(position) ? position : null,
        })
        .eq('id', id)
    })
  )

  revalidatePath('/[locale]', 'layout')
  revalidatePath('/fr/admin/featured', 'page')
}
