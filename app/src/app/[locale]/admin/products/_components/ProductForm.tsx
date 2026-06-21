'use client'

import { useRef, useState } from 'react'
import type { Category, Product, ProductVariant, ProductImage } from '@/types/database'
import { createProduct, updateProduct } from './actions'

interface Variant { name_fr: string; sku: string; price: string; stock: string }

interface Props {
  parents: Category[]
  childCategories: Category[]
  product?: Product
  variants?: ProductVariant[]
  images?: ProductImage[]
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

export default function ProductForm({ parents, childCategories, product, variants = [], images = [] }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [variantList, setVariantList] = useState<Variant[]>(
    variants.length > 0
      ? variants.map((v) => ({ name_fr: (v.name as { fr: string }).fr, sku: v.sku, price: v.price.toString(), stock: v.stock.toString() }))
      : [{ name_fr: '', sku: '', price: '', stock: '0' }]
  )
  const [existingImages] = useState<ProductImage[]>(images)
  const [newImagePreviews, setNewImagePreviews] = useState<{ url: string; name: string }[]>([])
  const [desc, setDesc] = useState((product?.description as { fr?: string })?.fr ?? '')
  const [active, setActive] = useState(product?.is_active ?? true)
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const categoryLabel = childCategories.find((c) => c.id === categoryId)
    ? (childCategories.find((c) => c.id === categoryId)!.name as { fr: string }).fr
    : '—'

  const allImages = existingImages.length + newImagePreviews.length

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const previews = files.map((f) => ({ url: URL.createObjectURL(f), name: f.name }))
    setNewImagePreviews((prev) => [...prev, ...previews])
  }

  function addVariant() {
    setVariantList((prev) => [...prev, { name_fr: '', sku: '', price: '', stock: '0' }])
  }

  function removeVariant(i: number) {
    setVariantList((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateVariant(i: number, field: keyof Variant, value: string) {
    setVariantList((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      variantList.forEach((v, i) => {
        fd.set(`variant_name_fr_${i}`, v.name_fr)
        fd.set(`variant_sku_${i}`, v.sku)
        fd.set(`variant_price_${i}`, v.price)
        fd.set(`variant_stock_${i}`, v.stock)
      })
      fd.set('is_active', active ? 'on' : '')
      fd.set('desc_fr', desc)
      fd.set('category_id', categoryId)
      if (product) {
        await updateProduct(product.id, fd)
      } else {
        await createProduct(fd)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setLoading(false)
    }
  }

  const inp = { style: { height: 44, padding: '0 14px', border: '1px solid #dcd8cf', borderRadius: 10, background: '#fcfbf9', fontSize: 14, color: '#1c2230', fontFamily: 'inherit', width: '100%' } as React.CSSProperties }
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: '26px 28px', boxShadow: '0 1px 2px rgba(28,34,48,0.04)' }
  const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7, color: '#3a4150' }
  const dot = <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c8643c', display: 'inline-block', marginRight: 10, flexShrink: 0 }} />

  return (
    <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 32px 100px' }}>

        {/* Breadcrumb + title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9aa3af', marginBottom: 10 }}>
            <a href="/fr/admin/products" style={{ color: '#9aa3af', textDecoration: 'none' }}>Produits</a>
            <span>›</span>
            <span style={{ color: '#6b6357' }}>{product ? 'Modifier' : 'Nouveau'}</span>
          </div>
          <h1 style={{ margin: 0, fontFamily: 'Spectral, serif', fontSize: 32, fontWeight: 600, letterSpacing: '-0.3px' }}>
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#8a8478' }}>Renseignez les informations puis publiez votre produit.</p>
        </div>

        {error && (
          <div style={{ background: '#fdf1ed', border: '1px solid #e6c3b8', color: '#b5503a', borderRadius: 10, padding: '12px 16px', fontSize: 14, marginBottom: 20 }}>{error}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

          {/* MAIN COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Détails card */}
            <section style={card}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 22 }}>{dot}<h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '0.2px' }}>Détails du produit</h2></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                    <label style={{ ...label, margin: 0 }}>Catégorie <span style={{ color: '#c8643c' }}>*</span></label>
                    <a
                      href="/fr/admin/categories/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, color: '#c8643c', textDecoration: 'none', fontWeight: 600 }}
                    >
                      + Nouvelle catégorie ↗
                    </a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <select
                      name="category_id"
                      required
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="admin-select"
                      style={{ width: '100%', height: 44, padding: '0 40px 0 14px', border: '1px solid #dcd8cf', borderRadius: 10, background: '#fcfbf9', fontSize: 14, color: '#1c2230', appearance: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
                    >
                      <option value="" disabled>Sélectionner une catégorie…</option>
                      {parents.map((parent) => (
                        <optgroup key={parent.id} label={(parent.name as { fr: string }).fr}>
                          {childCategories
                            .filter((c) => c.parent_id === parent.id)
                            .map((c) => (
                              <option key={c.id} value={c.id}>{(c.name as { fr: string }).fr}</option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9aa3af', fontSize: 11 }}>▼</span>
                  </div>
                </div>

                <div>
                  <label style={label}>Nom <span style={{ color: '#c8643c' }}>*</span></label>
                  <input name="name_fr" required defaultValue={(product?.name as { fr: string })?.fr ?? ''} placeholder="ex. Bécher en borosilicate 250 ml" className="admin-input" {...inp} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                    <label style={{ ...label, margin: 0 }}>Description</label>
                    <span style={{ fontSize: 12, color: '#a8a294' }}>{desc.length}/500</span>
                  </div>
                  <textarea
                    name="desc_fr"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value.slice(0, 500))}
                    placeholder="Décrivez les caractéristiques, les usages, les normes…"
                    className="admin-input"
                    style={{ width: '100%', minHeight: 120, padding: '12px 14px', border: '1px solid #dcd8cf', borderRadius: 10, background: '#fcfbf9', fontSize: 14, lineHeight: 1.6, color: '#1c2230', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={label}>Marque</label>
                  <input name="brand" defaultValue={product?.brand ?? ''} placeholder="ex. Duran, Corning, VWR" className="admin-input" style={{ ...inp.style, width: '60%', minWidth: 240 }} />
                </div>
              </div>
            </section>

            {/* Images card */}
            <section style={card}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 22 }}>{dot}<h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '0.2px' }}>Images</h2></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 12 }}>
                {existingImages.map((img) => (
                  <div key={img.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: '1px solid #ece9e1' }}>
                    <img src={`${supabaseUrl}/storage/v1/object/public/product-images/${img.storage_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {img.is_primary && (
                      <span style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(28,43,70,0.8)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>Principal</span>
                    )}
                  </div>
                ))}
                {newImagePreviews.map((p, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: '1px solid #c8e6c9' }}>
                    <img src={p.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="admin-add-img"
                  style={{ aspectRatio: '1', borderRadius: 12, border: '1.5px dashed #cfcabd', background: '#fcfbf9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', color: '#8a8478' }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>+</span>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>Ajouter</span>
                </div>
              </div>
              <input ref={fileInputRef} type="file" name="images" multiple accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
              <p style={{ margin: '14px 0 0', fontSize: 12, color: '#a8a294' }}>JPG, PNG ou WEBP — 5 Mo max par image. Cliquez pour téléverser.</p>
            </section>

            {/* Variantes card */}
            <section style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>{dot}<h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '0.2px' }}>Variantes <span style={{ color: '#c8643c' }}>*</span></h2></div>
                <button type="button" onClick={addVariant} className="admin-btn-add" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', border: '1px solid #dcd8cf', borderRadius: 9, background: '#fff', fontSize: 13, fontWeight: 600, color: '#1c2b46', cursor: 'pointer', fontFamily: 'inherit' }}>+ Ajouter une variante</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.2fr 1fr 0.8fr 36px', gap: 10, padding: '0 4px 8px', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a8a294' }}>
                <span>Nom</span><span>SKU</span><span>Prix (MAD)</span><span>Stock</span><span />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {variantList.map((v, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.2fr 1fr 0.8fr 36px', gap: 10, alignItems: 'center' }}>
                    <input value={v.name_fr} onChange={(e) => updateVariant(i, 'name_fr', e.target.value)} placeholder="50 ml" required className="admin-input" style={{ height: 42, padding: '0 12px', border: '1px solid #dcd8cf', borderRadius: 9, background: '#fcfbf9', fontSize: 13, fontFamily: 'inherit', color: '#1c2230', width: '100%' }} />
                    <input value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} placeholder="LAB-001" required className="admin-input" style={{ height: 42, padding: '0 12px', border: '1px solid #dcd8cf', borderRadius: 9, background: '#fcfbf9', fontSize: 13, fontFamily: 'ui-monospace, monospace', color: '#1c2230', width: '100%' }} />
                    <input value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} placeholder="0,00" type="number" min="0" step="0.01" required className="admin-input" style={{ height: 42, padding: '0 12px', border: '1px solid #dcd8cf', borderRadius: 9, background: '#fcfbf9', fontSize: 13, fontFamily: 'inherit', color: '#1c2230', textAlign: 'right', width: '100%' }} />
                    <input value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} placeholder="0" type="number" min="0" className="admin-input" style={{ height: 42, padding: '0 12px', border: '1px solid #dcd8cf', borderRadius: 9, background: '#fcfbf9', fontSize: 13, fontFamily: 'inherit', color: '#1c2230', textAlign: 'right', width: '100%' }} />
                    <button type="button" onClick={() => removeVariant(i)} disabled={variantList.length === 1} className="admin-remove-btn" style={{ width: 36, height: 36, border: '1px solid #ece9e1', borderRadius: 9, background: '#fff', color: '#b5503a', cursor: variantList.length === 1 ? 'not-allowed' : 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: variantList.length === 1 ? 0.3 : 1 }}>×</button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 84 }}>
            <section style={card}>
              <h2 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 600 }}>Statut</h2>
              <div onClick={() => setActive((a) => !a)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{active ? 'Actif' : 'Inactif'}</div>
                  <div style={{ fontSize: 12, color: '#a8a294', marginTop: 2 }}>Visible dans la boutique</div>
                </div>
                <div style={{ width: 46, height: 26, borderRadius: 13, background: active ? '#1c2b46' : '#d4d0c6', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: active ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
                </div>
              </div>
              <div style={{ height: 1, background: '#f0ede5', margin: '20px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#8a8478' }}>Variantes</span><span style={{ fontWeight: 600 }}>{variantList.length}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#8a8478' }}>Images</span><span style={{ fontWeight: 600 }}>{allImages}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#8a8478' }}>Catégorie</span><span style={{ fontWeight: 600 }}>{categoryLabel}</span></div>
              </div>
            </section>

            <section style={{ background: 'linear-gradient(160deg,#1c2b46,#243757)', borderRadius: 16, padding: '22px 24px', color: '#eef0f4' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8643c', display: 'inline-block' }} />
                Astuce
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#bcc4d4' }}>Ajoutez au moins 3 images nettes sur fond neutre et une description détaillée pour améliorer la conversion.</p>
            </section>
          </aside>
        </div>
      </div>

      {/* Sticky action bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid #e6e3db' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#a8a294' }}>Les champs marqués <span style={{ color: '#c8643c' }}>*</span> sont obligatoires.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="/fr/admin/products" className="admin-btn-ghost" style={{ height: 44, padding: '0 22px', border: '1px solid #dcd8cf', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#6b6357', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>Annuler</a>
            <button type="submit" disabled={loading} style={{ height: 44, padding: '0 26px', border: 'none', borderRadius: 11, background: loading ? '#8a95a8' : '#1c2b46', fontSize: 14, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(28,43,70,0.25)' }}>
              {loading ? 'Enregistrement…' : product ? 'Mettre à jour' : 'Créer le produit'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
