'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  className?: string
  onSubmit?: () => void
}

interface Suggestion {
  id: string
  name: string
  slug: string
  href: string
  image: string | null
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getImageUrl(storagePath: string) {
  return `${supabaseUrl}/storage/v1/object/public/product-images/${storagePath}`
}

export default function SearchBar({ className, onSubmit }: Props) {
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    const trimmed = q.trim()
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (trimmed.length < 2) {
      setSuggestions([])
      setActiveIndex(-1)
      return
    }

    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const res = await fetch(`/api/search-suggest?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        })
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(data.results ?? [])
        setActiveIndex(-1)
        setOpen(true)
      } catch {
        // request aborted or network error, ignore
      }
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [q])

  function goToProduct(href: string) {
    router.push(href)
    setOpen(false)
    onSubmit?.()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToProduct(suggestions[activeIndex].href)
      return
    }
    const trimmed = q.trim()
    if (!trimmed) return
    router.push(`/fr/recherche?q=${encodeURIComponent(trimmed)}`)
    setOpen(false)
    onSubmit?.()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="search-bar-wrap" ref={containerRef} style={{ position: 'relative' }}>
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
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Rechercher un produit"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          autoComplete="off"
        />
        <button type="submit" aria-label="Lancer la recherche">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul id="search-suggestions" className="search-suggestions" role="listbox">
          {suggestions.map((s, i) => (
            <li key={s.id} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                className={`search-suggestion${i === activeIndex ? ' active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goToProduct(s.href)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {s.image && (
                  <img src={getImageUrl(s.image)} alt="" width={32} height={32} />
                )}
                <span>{s.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
