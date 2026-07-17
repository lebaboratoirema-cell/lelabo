'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface Chip {
  label: string
  href: string
  slug: string | null // null = "Tous" chip
}

interface Props {
  chips: Chip[]
  activeSlug: string | null // null = "Tous" is active
  allHref: string
}

export default function CategoryChips({ chips, activeSlug, allHref }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const options = useMemo(
    () => [{ label: 'Tous', href: allHref, slug: null as string | null }, ...chips],
    [chips, allHref]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const active = options.find((o) => o.slug === activeSlug) ?? options[0]

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="cat-select" ref={rootRef}>
      <button
        type="button"
        className="cat-select-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{active.label}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="cat-select-panel">
          <input
            ref={inputRef}
            type="text"
            className="cat-select-search"
            placeholder="Rechercher une catégorie…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="cat-select-list" role="listbox">
            {filtered.length === 0 && <li className="cat-select-empty">Aucune catégorie trouvée</li>}
            {filtered.map((o) => (
              <li key={o.slug ?? 'all'}>
                <a
                  href={o.href}
                  role="option"
                  aria-selected={o.slug === activeSlug}
                  className={`cat-select-option${o.slug === activeSlug ? ' active' : ''}`}
                >
                  {o.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
