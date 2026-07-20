'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { Category } from '@/types/database'

interface Props {
  parents: Category[]
  subcategories: Category[]
  selectedCategory: string
  selectedSubcategory: string
  searchQuery: string
}

export default function FilterBar({ parents, subcategories, selectedCategory, selectedSubcategory, searchQuery }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState(searchQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => setSearch(searchQuery), [searchQuery])

  const visibleChildren = subcategories.filter((c) => c.parent_id === selectedCategory)

  function buildParams(overrides: Record<string, string>) {
    const params = new URLSearchParams()
    const merged = {
      category: selectedCategory,
      subcategory: selectedSubcategory,
      q: search,
      ...overrides,
    }
    if (merged.category) params.set('category', merged.category)
    if (merged.subcategory) params.set('subcategory', merged.subcategory)
    if (merged.q) params.set('q', merged.q)
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(buildParams({ category: e.target.value, subcategory: '' }))
  }

  function handleSubcategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(buildParams({ subcategory: e.target.value }))
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      router.push(buildParams({ q: val }))
    }, 400)
  }

  const selectStyle: React.CSSProperties = {
    height: 40,
    padding: '0 36px 0 14px',
    border: '1px solid #dcd8cf',
    borderRadius: 10,
    background: '#fff',
    fontSize: 14,
    color: '#1c2230',
    appearance: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    minWidth: 200,
  }

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
      <input
        type="text"
        value={search}
        onChange={handleSearchChange}
        placeholder="Rechercher un produit ou une marque…"
        style={{
          height: 40,
          padding: '0 14px',
          border: '1px solid #dcd8cf',
          borderRadius: 10,
          background: '#fff',
          fontSize: 14,
          color: '#1c2230',
          fontFamily: 'inherit',
          minWidth: 260,
          flex: '1 1 260px',
          maxWidth: 360,
        }}
      />

      <div style={{ position: 'relative' }}>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="admin-select"
          style={selectStyle}
        >
          <option value="">Toutes les catégories</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name.fr}
            </option>
          ))}
        </select>
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9aa3af', fontSize: 11 }}>▼</span>
      </div>

      {selectedCategory && visibleChildren.length > 0 && (
        <div style={{ position: 'relative' }}>
          <select
            value={selectedSubcategory}
            onChange={handleSubcategoryChange}
            className="admin-select"
            style={selectStyle}
          >
            <option value="">Toutes les sous-catégories</option>
            {visibleChildren.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name.fr}
              </option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9aa3af', fontSize: 11 }}>▼</span>
        </div>
      )}
    </div>
  )
}
