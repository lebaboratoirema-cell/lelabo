'use client'

import { useState } from 'react'
import type { Category } from '@/types/database'
import { createCategory, updateCategory } from './actions'
import { slugify } from '@/lib/slugify'

interface Props {
  categories: Category[]   // existing categories for parent select (excludes self on edit)
  category?: Category      // present when editing
}

export default function CategoryForm({ categories, category }: Props) {
  const [nameFr, setNameFr] = useState((category?.name as { fr: string })?.fr ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  const [slugManual, setSlugManual] = useState(!!category)
  const [parentId, setParentId] = useState(category?.parent_id ?? '')
  const [active, setActive] = useState(category?.is_active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleNameChange(value: string) {
    setNameFr(value)
    if (!slugManual) setSlug(slugify(value))
  }

  function handleSlugChange(value: string) {
    setSlug(value)
    setSlugManual(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      fd.set('name_fr', nameFr)
      fd.set('slug', slug)
      fd.set('parent_id', parentId)
      fd.set('is_active', active ? 'on' : '')
      if (category) {
        await updateCategory(category.id, fd)
      } else {
        await createCategory(fd)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setLoading(false)
    }
  }

  const card: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #ebe8e0',
    borderRadius: 16,
    padding: '26px 28px',
    boxShadow: '0 1px 2px rgba(28,34,48,0.04)',
  }
  const label: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 7,
    color: '#3a4150',
  }
  const inp: React.CSSProperties = {
    height: 44,
    padding: '0 14px',
    border: '1px solid #dcd8cf',
    borderRadius: 10,
    background: '#fcfbf9',
    fontSize: 14,
    color: '#1c2230',
    fontFamily: 'inherit',
    width: '100%',
  }
  const dot = (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: '#c8643c',
        display: 'inline-block',
        marginRight: 10,
        flexShrink: 0,
      }}
    />
  )

  return (
    <form onSubmit={handleSubmit}>
      <div className="admin-page-pad" style={{ paddingBottom: 100 }}>

        {/* Breadcrumb + title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9aa3af', marginBottom: 10 }}>
            <a href="/fr/admin/categories" style={{ color: '#9aa3af', textDecoration: 'none' }}>Catégories</a>
            <span>›</span>
            <span style={{ color: '#6b6357' }}>{category ? 'Modifier' : 'Nouvelle'}</span>
          </div>
          <h1 style={{ margin: 0, fontFamily: 'Spectral, serif', fontSize: 32, fontWeight: 600, letterSpacing: '-0.3px' }}>
            {category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h1>
        </div>

        {error && (
          <div style={{ background: '#fdf1ed', border: '1px solid #e6c3b8', color: '#b5503a', borderRadius: 10, padding: '12px 16px', fontSize: 14, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <section style={card}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 22 }}>
            {dot}
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Détails</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div>
              <label style={label}>Nom (français) <span style={{ color: '#c8643c' }}>*</span></label>
              <input
                required
                value={nameFr}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="ex. Verrerie de laboratoire"
                className="admin-input"
                style={inp}
              />
            </div>

            <div>
              <label style={label}>Slug <span style={{ color: '#c8643c' }}>*</span></label>
              <input
                required
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="verrerie-de-laboratoire"
                className="admin-input"
                style={{ ...inp, fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
              />
              <p style={{ margin: '5px 0 0', fontSize: 12, color: '#a8a294' }}>
                Auto-généré depuis le nom. Modifiez manuellement si besoin.
              </p>
            </div>

            <div>
              <label style={label}>Catégorie parente</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="admin-select"
                  style={{ ...inp, padding: '0 40px 0 14px', appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="">Aucune (catégorie racine)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {(c.name as { fr: string }).fr}
                    </option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9aa3af', fontSize: 11 }}>▼</span>
              </div>
            </div>

            <div>
              <label style={label}>Statut</label>
              <div
                onClick={() => setActive((a) => !a)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', width: 'fit-content' }}
              >
                <div style={{ width: 46, height: 26, borderRadius: 13, background: active ? '#1c2b46' : '#d4d0c6', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: active ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* Sticky action bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid #e6e3db' }}>
        <div className="admin-form-footer" style={{ padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span className="admin-form-footer-hint" style={{ fontSize: 13, color: '#a8a294' }}>Les champs marqués <span style={{ color: '#c8643c' }}>*</span> sont obligatoires.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="/fr/admin/categories" className="admin-btn-ghost" style={{ height: 44, padding: '0 22px', border: '1px solid #dcd8cf', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#6b6357', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>Annuler</a>
            <button
              type="submit"
              disabled={loading}
              style={{ height: 44, padding: '0 26px', border: 'none', borderRadius: 11, background: loading ? '#8a95a8' : '#1c2b46', fontSize: 14, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(28,43,70,0.25)' }}
            >
              {loading ? 'Enregistrement…' : category ? 'Mettre à jour' : 'Créer la catégorie'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
