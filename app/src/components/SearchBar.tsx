'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  className?: string
  onSubmit?: () => void
}

export default function SearchBar({ className, onSubmit }: Props) {
  const [q, setQ] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = q.trim()
    if (!trimmed) return
    router.push(`/fr/recherche?q=${encodeURIComponent(trimmed)}`)
    onSubmit?.()
  }

  return (
    <form
      className={`search-bar${className ? ` ${className}` : ''}`}
      role="search"
      onSubmit={handleSubmit}
    >
      <input
        type="search"
        name="q"
        placeholder="Rechercher un produit…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Rechercher un produit"
      />
      <button type="submit" aria-label="Lancer la recherche">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  )
}
