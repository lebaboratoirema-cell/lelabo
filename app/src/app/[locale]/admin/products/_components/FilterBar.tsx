'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { Category } from '@/types/database'

interface Props {
  parents: Category[]
  children: Category[]
  selectedCategory: string
  selectedSubcategory: string
}

export default function FilterBar({ parents, children, selectedCategory, selectedSubcategory }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const visibleChildren = children.filter((c) => c.parent_id === selectedCategory)

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    router.push(val ? `${pathname}?category=${val}` : pathname)
  }

  function handleSubcategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    router.push(
      val
        ? `${pathname}?category=${selectedCategory}&subcategory=${val}`
        : `${pathname}?category=${selectedCategory}`
    )
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
              {(p.name as { fr: string }).fr}
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
                {(c.name as { fr: string }).fr}
              </option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9aa3af', fontSize: 11 }}>▼</span>
        </div>
      )}
    </div>
  )
}
