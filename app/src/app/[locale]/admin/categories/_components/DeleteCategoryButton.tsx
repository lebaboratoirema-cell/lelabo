'use client'

import { useState } from 'react'
import { deleteCategory } from './actions'

export default function DeleteCategoryButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (!confirm('Supprimer cette catégorie ?')) return
    setLoading(true)
    setError(null)
    try {
      await deleteCategory(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <p style={{ fontSize: 12, color: '#b5503a', margin: '4px 0 0' }}>{error}</p>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          height: 34,
          padding: '0 14px',
          border: '1px solid #ece9e1',
          borderRadius: 9,
          background: '#fff',
          color: loading ? '#a8a294' : '#b5503a',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'inherit',
        }}
      >
        {loading ? 'Suppression…' : 'Supprimer'}
      </button>
    </div>
  )
}
