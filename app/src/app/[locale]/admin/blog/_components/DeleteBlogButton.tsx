'use client'

import { useRouter } from 'next/navigation'
import { deleteBlogPost } from './actions'

export default function DeleteBlogButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Supprimer cet article ?')) return
    await deleteBlogPost(id)
    router.refresh()
  }

  return (
    <button type="button" onClick={handleDelete} style={{ fontSize: 13, fontWeight: 600, color: '#c8643c', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
      Supprimer
    </button>
  )
}
