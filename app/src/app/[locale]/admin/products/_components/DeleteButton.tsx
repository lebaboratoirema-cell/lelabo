'use client'

import { useRouter } from 'next/navigation'
import { deleteProduct } from './actions'

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Supprimer ce produit ?')) return
    await deleteProduct(id)
    router.refresh()
  }

  return (
    <button type="button" onClick={handleDelete} style={{ fontSize: 13, fontWeight: 600, color: '#c8643c', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
      Supprimer
    </button>
  )
}
