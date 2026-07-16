'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { slugify } from '@/lib/slugify'

export async function createBlogPost(formData: FormData) {
  const supabase = createServiceClient()
  const title = formData.get('title') as string
  const baseSlug = slugify(title)

  let slug = baseSlug
  let attempt = 0
  while (true) {
    const { count } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug)
    if (count === 0) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const isPublished = formData.get('is_published') === 'on'

  const { error } = await supabase.from('blog_posts').insert({
    slug,
    title,
    excerpt: (formData.get('excerpt') as string) || null,
    content: formData.get('content') as string,
    cover_image: (formData.get('cover_image') as string) || null,
    author: (formData.get('author') as string) || 'lelaboratoire.ma',
    meta_description: (formData.get('meta_description') as string) || null,
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/fr/blog', 'page')
  redirect('/fr/admin/blog')
}

export async function updateBlogPost(id: string, formData: FormData) {
  const supabase = createServiceClient()

  const { data: existing } = await supabase
    .from('blog_posts')
    .select('is_published, published_at')
    .eq('id', id)
    .single()

  const isPublished = formData.get('is_published') === 'on'
  const publishedAt = isPublished
    ? existing?.published_at ?? new Date().toISOString()
    : null

  const { error } = await supabase
    .from('blog_posts')
    .update({
      title: formData.get('title') as string,
      excerpt: (formData.get('excerpt') as string) || null,
      content: formData.get('content') as string,
      cover_image: (formData.get('cover_image') as string) || null,
      author: (formData.get('author') as string) || 'lelaboratoire.ma',
      meta_description: (formData.get('meta_description') as string) || null,
      is_published: isPublished,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/fr/blog', 'page')
  redirect('/fr/admin/blog')
}

export async function deleteBlogPost(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/fr/blog', 'page')
}
