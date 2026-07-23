'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateFeaturedProducts } from './actions'

interface Row {
  id: string
  name: string
  categoryName: string
  isFeatured: boolean
  featuredPosition: number | null
  imageUrl: string | null
}

export default function FeaturedForm({ products }: { products: Row[] }) {
  const router = useRouter()
  const [checked, setChecked] = useState<Set<string>>(
    new Set(products.filter((p) => p.isFeatured).map((p) => p.id))
  )
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [limitHit, setLimitHit] = useState(false)

  const LIMIT = 15

  function toggle(id: string) {
    setChecked((prev) => {
      if (!prev.has(id) && prev.size >= LIMIT) {
        setLimitHit(true)
        return prev
      }
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setLimitHit(false)
      return next
    })
  }

  function handleSubmit(formData: FormData) {
    setSaved(false)
    setErrorMsg(null)
    startTransition(async () => {
      try {
        await updateFeaturedProducts(formData)
        router.refresh()
        setSaved(true)
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Échec de l’enregistrement')
      }
    })
  }

  return (
    <form action={handleSubmit}>
      <div
        style={{
          position: 'sticky',
          top: 60,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          padding: '14px 20px',
          background: limitHit ? '#fdf1ed' : '#fff',
          border: `1px solid ${limitHit ? '#e6c3b8' : '#ebe8e0'}`,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 14, color: limitHit ? '#b0452a' : '#6b6357' }}>
          {checked.size} / {LIMIT} produits sélectionnés
          {limitHit && ' — limite de 15 produits atteinte, décochez-en un pour en choisir un autre'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {errorMsg && <span style={{ fontSize: 13, color: '#b0452a' }}>{errorMsg}</span>}
          {saved && !pending && <span style={{ fontSize: 13, color: '#2e7d32' }}>Enregistré ✓</span>}
          <button
            type="submit"
            disabled={pending}
            style={{
              height: 42,
              padding: '0 22px',
              border: 'none',
              borderRadius: 10,
              background: pending ? '#9aa3af' : '#1c2b46',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              cursor: pending ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {pending ? 'Enregistrement…' : 'Enregistrer la sélection'}
          </button>
        </div>
      </div>

      <div className="admin-table-scroll" style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, boxShadow: '0 1px 2px rgba(28,34,48,0.04)' }}>
        <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0ede5' }}>
              {['En vedette', '', 'Nom', 'Catégorie', 'Ordre'].map((h, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: i === 0 || i === 4 ? 'center' : 'left',
                    padding: '14px 20px',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    color: '#a8a294',
                    background: '#faf9f6',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => {
              const isChecked = checked.has(p.id)
              const isLocked = !isChecked && checked.size >= LIMIT
              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: idx < products.length - 1 ? '1px solid #f4f2ec' : 'none',
                    opacity: isLocked ? 0.45 : 1,
                  }}
                >
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <input type="hidden" name="product_id" value={p.id} />
                    <input
                      type="checkbox"
                      name={`featured_${p.id}`}
                      checked={isChecked}
                      disabled={isLocked}
                      onChange={() => toggle(p.id)}
                      style={{ width: 18, height: 18, cursor: isLocked ? 'not-allowed' : 'pointer', accentColor: '#1c2b46' }}
                    />
                  </td>
                  <td style={{ padding: '8px 8px 8px 20px' }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid #ebe8e0', display: 'block' }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f4f2ec' }} />
                    )}
                  </td>
                  <td style={{ padding: '12px 20px', fontWeight: 600, color: '#1c2230' }}>{p.name}</td>
                  <td style={{ padding: '12px 20px', color: '#8a8478' }}>{p.categoryName}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <input
                      type="number"
                      name={`position_${p.id}`}
                      defaultValue={p.featuredPosition ?? ''}
                      placeholder="—"
                      disabled={isLocked}
                      className="admin-input"
                      style={{ width: 64, height: 34, textAlign: 'center', border: '1px solid #dcd8cf', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </form>
  )
}
