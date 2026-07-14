import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import BlogForm from '../../_components/BlogForm'
import type { BlogPost } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: post } = await supabase.from('blog_posts').select('*').eq('id', id).single()

  if (!post) notFound()

  return <BlogForm post={post as BlogPost} />
}
