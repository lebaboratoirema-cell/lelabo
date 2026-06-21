# Product Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add product detail pages nested under existing category/subcategory URLs, with variant pill selectors, image gallery, and a quote request modal.

**Architecture:** Extend existing `[subcategory]/page.tsx` files to detect product slugs, add `[subcategory]/[product]/page.tsx` for products under subcategories, share a single `ProductDetailPage` server component, and add a `QuoteModal` client island. No schema changes.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase (Postgres), Tailwind v4, `next/navigation`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/supabase/queries.ts` | Modify | Add `getProductBySlug`, `getRelatedProducts`, export `ProductWithVariants` type |
| `src/components/ProductGrid.tsx` | Modify | Add `basePath` prop; wrap cards in `<a>` |
| `src/components/ProductDetailPage.tsx` | Create | Server component: gallery, info, trust badges, tabs, related grid |
| `src/components/QuoteModal.tsx` | Create | Client island: modal overlay + quote form |
| `src/app/actions/quote.ts` | Create | `submitQuote` server action |
| `src/app/[locale]/glassware/[subcategory]/page.tsx` | Modify | Try category slug → subcategory page; else try product slug → product page |
| `src/app/[locale]/chemicals/[subcategory]/page.tsx` | Modify | Same pattern |
| `src/app/[locale]/lab-equipment/[subcategory]/page.tsx` | Modify | Same pattern |
| `src/app/[locale]/glassware/[subcategory]/[product]/page.tsx` | Create | Product under a glassware subcategory |
| `src/app/[locale]/chemicals/[subcategory]/[product]/page.tsx` | Create | Product under a chemicals subcategory |
| `src/app/[locale]/lab-equipment/[subcategory]/[product]/page.tsx` | Create | Product under a lab-equipment subcategory |
| `src/app/[locale]/glassware/page.tsx` | Modify | Pass `basePath` to `ProductGrid` |
| `src/app/[locale]/chemicals/page.tsx` | Modify | Pass `basePath` to `ProductGrid` |
| `src/app/[locale]/lab-equipment/page.tsx` | Modify | Pass `basePath` to `ProductGrid` |

---

## Task 1: Add `getProductBySlug` and `getRelatedProducts` to queries

**Files:**
- Modify: `app/src/lib/supabase/queries.ts`

- [ ] **Step 1: Add `ProductWithVariants` type and two new queries**

Open `app/src/lib/supabase/queries.ts` and append after the existing `getProductsByFamily` function:

```ts
import type { Category, Product, ProductImage, ProductVariant } from '@/types/database'

// Add to existing imports at top of file (merge with existing import line):
// import type { Category, Product, ProductImage, ProductVariant } from '@/types/database'

export type ProductWithVariants = Product & {
  product_variants: ProductVariant[]
  product_images: Pick<ProductImage, 'id' | 'storage_path' | 'alt' | 'is_primary' | 'position'>[]
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_variants(*), product_images(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .order('position', { referencedTable: 'product_variants', ascending: true })
    .order('position', { referencedTable: 'product_images', ascending: true })
    .maybeSingle()
  return (data as ProductWithVariants | null) ?? null
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 3,
): Promise<ProductWithImage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(storage_path, is_primary)')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', excludeId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as ProductWithImage[]) ?? []
}
```

Also update the existing import at the top of the file — add `ProductVariant` to the type import:

```ts
import type { Category, Product, ProductImage, ProductVariant } from '@/types/database'
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or only pre-existing errors unrelated to queries.ts).

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/supabase/queries.ts
git commit -m "feat(queries): add getProductBySlug and getRelatedProducts"
```

---

## Task 2: Update `ProductGrid` to link cards to product pages

**Files:**
- Modify: `app/src/components/ProductGrid.tsx`

- [ ] **Step 1: Add `basePath` prop and wrap each card in `<a>`**

Replace the entire file content:

```tsx
import type { ProductWithImage } from '@/lib/supabase/queries'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getImageUrl(storagePath: string): string {
  return `${supabaseUrl}/storage/v1/object/public/product-images/${storagePath}`
}

interface Props {
  products: ProductWithImage[]
  basePath: string
}

export default function ProductGrid({ products, basePath }: Props) {
  if (products.length === 0) {
    return (
      <p className="empty-state">Aucun produit dans cette catégorie pour l&apos;instant.</p>
    )
  }

  return (
    <div className="product-grid">
      {products.map((p) => {
        const primaryImage = p.product_images.find((img) => img.is_primary) ?? p.product_images[0]
        const imgSrc = primaryImage ? getImageUrl(primaryImage.storage_path) : '/images/glassware.jpg'

        return (
          <a className="product-card reveal" href={`${basePath}/${p.slug}`} key={p.id}>
            <div className="pimg">
              <img src={imgSrc} alt={(p.name as { fr: string }).fr} />
              {p.brand && <span className="tag">{p.brand}</span>}
            </div>
            <div className="pbody">
              <h3>{(p.name as { fr: string }).fr}</h3>
              <p>{(p.description as { fr?: string } | null)?.fr ?? ''}</p>
              <div className="pfoot">
                <span className="price">Sur demande</span>
                <span className="more">Voir →</span>
              </div>
            </div>
          </a>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Fix all callers — pass `basePath` prop**

The following files call `<ProductGrid>` and must now pass `basePath`:

**`app/src/app/[locale]/glassware/page.tsx`** — change:
```tsx
<ProductGrid products={allProducts} />
```
to:
```tsx
<ProductGrid products={allProducts} basePath="/fr/glassware" />
```

**`app/src/app/[locale]/chemicals/page.tsx`** — change:
```tsx
<ProductGrid products={allProducts} />
```
to:
```tsx
<ProductGrid products={allProducts} basePath="/fr/chemicals" />
```

**`app/src/app/[locale]/lab-equipment/page.tsx`** — change:
```tsx
<ProductGrid products={allProducts} />
```
to:
```tsx
<ProductGrid products={allProducts} basePath="/fr/lab-equipment" />
```

**`app/src/app/[locale]/glassware/[subcategory]/page.tsx`** — change:
```tsx
<ProductGrid products={products} />
```
to:
```tsx
<ProductGrid products={products} basePath={`/fr/glassware/${child.slug}`} />
```

**`app/src/app/[locale]/chemicals/[subcategory]/page.tsx`** — change:
```tsx
<ProductGrid products={products} />
```
to:
```tsx
<ProductGrid products={products} basePath={`/fr/chemicals/${child.slug}`} />
```

**`app/src/app/[locale]/lab-equipment/[subcategory]/page.tsx`** — change:
```tsx
<ProductGrid products={products} />
```
to:
```tsx
<ProductGrid products={products} basePath={`/fr/lab-equipment/${child.slug}`} />
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/ProductGrid.tsx \
  "app/src/app/[locale]/glassware/page.tsx" \
  "app/src/app/[locale]/chemicals/page.tsx" \
  "app/src/app/[locale]/lab-equipment/page.tsx" \
  "app/src/app/[locale]/glassware/[subcategory]/page.tsx" \
  "app/src/app/[locale]/chemicals/[subcategory]/page.tsx" \
  "app/src/app/[locale]/lab-equipment/[subcategory]/page.tsx"
git commit -m "feat(product-grid): add basePath prop, link cards to product pages"
```

---

## Task 3: Create `submitQuote` server action

**Files:**
- Create: `app/src/app/actions/quote.ts`

- [ ] **Step 1: Create the server action file**

```ts
'use server'

export interface QuotePayload {
  productName: string
  variantName?: string
  name: string
  email: string
  phone?: string
  message: string
}

export interface QuoteResult {
  success: boolean
  error?: string
}

export async function submitQuote(payload: QuotePayload): Promise<QuoteResult> {
  try {
    // MVP: log to console. Email integration added later.
    console.log('[QUOTE REQUEST]', {
      product: payload.productName,
      variant: payload.variantName ?? '—',
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? '—',
      message: payload.message,
      timestamp: new Date().toISOString(),
    })
    return { success: true }
  } catch (err) {
    console.error('[QUOTE ERROR]', err)
    return { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/src/app/actions/quote.ts"
git commit -m "feat(actions): add submitQuote server action (MVP console log)"
```

---

## Task 4: Create `QuoteModal` client component

**Files:**
- Create: `app/src/components/QuoteModal.tsx`

- [ ] **Step 1: Create the modal component**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { submitQuote } from '@/app/actions/quote'

interface Props {
  productName: string
  variantName?: string
}

export default function QuoteModal({ productName, variantName }: Props) {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const defaultMessage = variantName
    ? `Je souhaite un devis pour : ${productName} — ${variantName}`
    : `Je souhaite un devis pour : ${productName}`

  function openModal() {
    setOpen(true)
    setSuccess(false)
    setError(null)
  }

  function closeModal() {
    setOpen(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    startTransition(async () => {
      const result = await submitQuote({
        productName,
        variantName,
        name: data.get('name') as string,
        email: data.get('email') as string,
        phone: (data.get('phone') as string) || undefined,
        message: data.get('message') as string,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => setOpen(false), 3000)
      } else {
        setError(result.error ?? 'Erreur inconnue.')
      }
    })
  }

  return (
    <>
      <button className="btn btn-quote" onClick={openModal}>
        Demander un devis
      </button>

      {open && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-box">
            <button className="modal-close" onClick={closeModal} aria-label="Fermer">&times;</button>
            <h2 className="modal-title">Demander un devis</h2>
            <p className="modal-product">{productName}{variantName ? ` — ${variantName}` : ''}</p>

            {success ? (
              <div className="modal-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40"><path d="M20 6L9 17l-5-5"/></svg>
                <p>Votre demande a été envoyée. Nous vous contacterons rapidement.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="modal-form">
                <label>
                  Nom complet <span aria-hidden>*</span>
                  <input name="name" type="text" required placeholder="Votre nom" />
                </label>
                <label>
                  Email <span aria-hidden>*</span>
                  <input name="email" type="email" required placeholder="votre@email.com" />
                </label>
                <label>
                  Téléphone
                  <input name="phone" type="tel" placeholder="+212 6XX XXX XXX" />
                </label>
                <label>
                  Message
                  <textarea name="message" rows={4} defaultValue={defaultMessage} />
                </label>
                {error && <p className="modal-error">{error}</p>}
                <button type="submit" className="btn btn-quote" disabled={isPending}>
                  {isPending ? 'Envoi…' : 'Envoyer la demande'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Add modal CSS**

The project uses a global CSS file. Find it:

```bash
find app/src -name "*.css" | head -10
```

Open the global CSS file and append these styles at the end:

```css
/* ── Quote Modal ─────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 40px 36px 36px;
  max-width: 520px;
  width: 100%;
  position: relative;
  box-shadow: 0 24px 64px rgba(0,0,0,.18);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
}

.modal-close:hover { color: #111; }

.modal-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 6px;
  color: #0d1b2a;
}

.modal-product {
  font-size: 14px;
  color: var(--teal, #1d9e7a);
  font-weight: 600;
  margin: 0 0 24px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.modal-form input,
.modal-form textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 15px;
  font-family: inherit;
  transition: border-color .15s;
}

.modal-form input:focus,
.modal-form textarea:focus {
  outline: none;
  border-color: var(--teal, #1d9e7a);
}

.modal-error {
  color: #dc2626;
  font-size: 13px;
  margin: 0;
}

.modal-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  text-align: center;
  color: #1f8a5b;
}

.modal-success p {
  font-size: 15px;
  color: #374151;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/QuoteModal.tsx "app/src/app/globals.css"
git commit -m "feat(ui): add QuoteModal client component with quote form"
```

(Adjust the CSS file path to wherever the project's global CSS lives.)

---

## Task 5: Create `ProductDetailPage` server component

**Files:**
- Create: `app/src/components/ProductDetailPage.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { ProductWithVariants, ProductWithImage } from '@/lib/supabase/queries'
import ProductGrid from '@/components/ProductGrid'
import QuoteModal from '@/components/QuoteModal'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getImageUrl(storagePath: string): string {
  return `${supabaseUrl}/storage/v1/object/public/product-images/${storagePath}`
}

interface Props {
  product: ProductWithVariants
  related: ProductWithImage[]
  breadcrumbs: { label: string; href: string }[]
  basePath: string
}

export default function ProductDetailPage({ product, related, breadcrumbs, basePath }: Props) {
  const name = (product.name as { fr: string }).fr
  const description = (product.description as { fr?: string } | null)?.fr ?? ''
  const hasVariants = product.product_variants.length > 0

  const primaryImage = product.product_images.find((img) => img.is_primary) ?? product.product_images[0]
  const imgSrc = primaryImage ? getImageUrl(primaryImage.storage_path) : '/images/glassware.jpg'
  const allImages = product.product_images.map((img) => getImageUrl(img.storage_path))

  return (
    <>
      {/* Breadcrumb banner */}
      <section className="page-banner" style={{ padding: '54px 0' }}>
        <img className="bgimg" src={allImages[0] ?? '/images/glassware.jpg'} alt="" />
        <div className="wrap">
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            {breadcrumbs.map((bc) => (
              <span key={bc.href}>
                <span className="sep">/</span>
                <a href={bc.href}>{bc.label}</a>
              </span>
            ))}
            <span className="sep">/</span>
            {name}
          </div>
        </div>
      </section>

      {/* Product detail */}
      <section className="block" style={{ padding: '60px 0 80px' }}>
        <div className="wrap">
          <div className="pd-grid">
            {/* Gallery */}
            <div className="pd-gallery">
              <div className="pd-main">
                <span className="pd-badge">En stock</span>
                <img id="pdMain" src={imgSrc} alt={name} />
              </div>
              {allImages.length > 1 && (
                <div className="pd-thumbs">
                  {allImages.map((src, i) => (
                    <button
                      key={src}
                      className={`pd-thumb${i === 0 ? ' active' : ''}`}
                      data-src={src}
                    >
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="pd-info">
              {product.brand && <span className="pd-brand">{product.brand}</span>}
              <h1>{name}</h1>
              <p className="pd-lead">{description}</p>

              <div className="pd-quote-price">
                <span className="big">Sur demande</span>
                <span className="label">Prix sur devis · Remises volume disponibles</span>
              </div>

              {/* Variants — only when product has variants */}
              {hasVariants && (
                <div className="pd-opt">
                  <div className="opt-label">Variante</div>
                  <div className="opt-row">
                    {product.product_variants.map((v) => (
                      <span key={v.id} className="opt-pill">
                        {(v.name as { fr: string }).fr}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quote CTA — client island handles modal */}
              <div className="pd-buy">
                <QuoteModal productName={name} />
              </div>

              <div className="pd-meta">
                <div className="mrow"><b>Référence</b> <span>{product.slug}</span></div>
                <div className="mrow">
                  <b>Catégorie</b>{' '}
                  <span>
                    {breadcrumbs.map((bc, i) => (
                      <span key={bc.href}>
                        {i > 0 && ', '}
                        <a href={bc.href}>{bc.label}</a>
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="pd-trust reveal">
            <div className="trust">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/></svg>
              </span>
              <div><h5>Livraison nationale</h5><p>Partout au Maroc</p></div>
            </div>
            <div className="trust">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>
              </span>
              <div><h5>Retours 7 jours</h5><p>Sur articles en stock</p></div>
            </div>
            <div className="trust">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.1V12a10 10 0 11-5.9-9.1"/><path d="M22 4L12 14.1l-3-3"/></svg>
              </span>
              <div><h5>Qualité certifiée</h5><p>Conforme ISO &amp; DIN</p></div>
            </div>
            <div className="trust">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </span>
              <div><h5>Conseil technique</h5><p>Équipe experte disponible</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Description tab — static for MVP */}
      <section className="block bg-soft" style={{ padding: '70px 0' }}>
        <div className="wrap">
          <div className="pd-tabs-nav">
            <button className="active">Description</button>
            <button>Livraison &amp; retours</button>
          </div>
          <div className="pd-panel active">
            <p>{description}</p>
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="block" style={{ padding: '80px 0 90px' }}>
          <div className="wrap">
            <div className="section-head reveal" style={{ marginBottom: '40px' }}>
              <span className="eyebrow">Vous pourriez aussi avoir besoin</span>
              <h2>Produits similaires</h2>
            </div>
            <ProductGrid products={related} basePath={basePath} />
          </div>
        </section>
      )}
    </>
  )
}
```

- [ ] **Step 2: Add product detail CSS**

Append to the project's global CSS file:

```css
/* ── Product Detail Page ─────────────────────────────────────────────────── */
.pd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
}

@media (max-width: 800px) {
  .pd-grid { grid-template-columns: 1fr; gap: 32px; }
}

.pd-gallery { position: relative; }

.pd-main {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: #f8f9fa;
}

.pd-main img {
  width: 100%;
  display: block;
  transition: transform .1s;
}

.pd-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: #1d9e7a;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  z-index: 1;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.pd-thumbs {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.pd-thumb {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  background: #f0f0f0;
  padding: 0;
}

.pd-thumb.active { border-color: var(--teal, #1d9e7a); }

.pd-thumb img { width: 100%; height: 100%; object-fit: cover; }

.pd-info { display: flex; flex-direction: column; gap: 20px; }

.pd-brand {
  font-size: 13px;
  font-weight: 600;
  color: var(--teal, #1d9e7a);
  text-transform: uppercase;
  letter-spacing: .06em;
}

.pd-info h1 {
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 800;
  color: #0d1b2a;
  margin: 0;
  line-height: 1.2;
}

.pd-lead {
  color: #4b5563;
  line-height: 1.7;
  font-size: 15px;
  margin: 0;
}

.pd-quote-price { display: flex; flex-direction: column; gap: 4px; }

.pd-quote-price .big {
  font-size: 24px;
  font-weight: 800;
  color: #0d1b2a;
}

.pd-quote-price .label {
  font-size: 12px;
  color: #9ca3af;
}

.pd-opt { display: flex; flex-direction: column; gap: 10px; }

.opt-label {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.opt-row { display: flex; flex-wrap: wrap; gap: 8px; }

.opt-pill {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1.5px solid #d1d5db;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: border-color .15s, background .15s;
}

.opt-pill:hover,
.opt-pill.active {
  border-color: var(--teal, #1d9e7a);
  background: #f0fdf4;
  color: #1d9e7a;
}

.pd-buy { display: flex; gap: 12px; align-items: center; }

.btn-quote {
  background: var(--teal, #1d9e7a);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s;
}

.btn-quote:hover { background: #178a68; }

.pd-meta { display: flex; flex-direction: column; gap: 8px; padding-top: 12px; border-top: 1px solid #e5e7eb; }

.mrow {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
}

.mrow b { color: #374151; font-weight: 600; min-width: 90px; }

.pd-trust {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 800px) {
  .pd-trust { grid-template-columns: 1fr 1fr; }
}

.trust { display: flex; gap: 14px; align-items: flex-start; }

.trust .ico {
  width: 44px;
  height: 44px;
  background: #f0fdf4;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--teal, #1d9e7a);
}

.trust .ico svg { width: 22px; height: 22px; }

.trust h5 {
  font-size: 13px;
  font-weight: 700;
  color: #0d1b2a;
  margin: 0 0 2px;
}

.trust p { font-size: 12px; color: #6b7280; margin: 0; }

.pd-tabs-nav {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 32px;
}

.pd-tabs-nav button {
  padding: 12px 24px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color .15s, border-color .15s;
}

.pd-tabs-nav button.active {
  color: var(--teal, #1d9e7a);
  border-bottom-color: var(--teal, #1d9e7a);
}

.pd-panel { display: none; }
.pd-panel.active { display: block; }
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/ProductDetailPage.tsx "app/src/app/globals.css"
git commit -m "feat(ui): add ProductDetailPage server component with gallery, variants, trust badges"
```

---

## Task 6: Modify `[subcategory]/page.tsx` to handle product slugs (3 files)

This task modifies the 3 existing subcategory pages so that if the slug does not match a child category, it tries to find a product under the family's parent.

**Files:**
- Modify: `app/src/app/[locale]/glassware/[subcategory]/page.tsx`
- Modify: `app/src/app/[locale]/chemicals/[subcategory]/page.tsx`
- Modify: `app/src/app/[locale]/lab-equipment/[subcategory]/page.tsx`

- [ ] **Step 1: Update glassware `[subcategory]/page.tsx`**

Replace entire file:

```tsx
import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import ProductGrid from '@/components/ProductGrid'
import CategoryChips from '@/components/CategoryChips'
import ProductDetailPage from '@/components/ProductDetailPage'
import {
  getCategoryBySlug,
  getChildCategories,
  getProductsByCategory,
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ subcategory: string }>
}

export default async function GlasswareSubcategoryPage({ params }: Props) {
  const { subcategory } = await params
  const meta = CATEGORY_ROUTE_META.glassware

  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS.glassware)
  if (!parent) notFound()

  // Try slug as a child category first
  const child = await getCategoryBySlug(subcategory)
  if (child && child.parent_id === parent.id) {
    // ── Subcategory page (existing behavior) ──
    const siblings = await getChildCategories(parent.id)
    const products = await getProductsByCategory(child.id)

    const chips = siblings.map((c) => ({
      label: (c.name as { fr: string }).fr,
      href: `/fr/glassware/${c.slug}`,
      slug: c.slug,
    }))

    const childLabel = (child.name as { fr: string }).fr

    return (
      <>
        <ScrollReveal />
        <TopBar />
        <Header />

        <section className="page-banner">
          <img className="bgimg" src={meta.bannerImage} alt="" />
          <div className="wrap">
            <h1>{childLabel}</h1>
            <div className="breadcrumb">
              <a href="/fr">Accueil</a>
              <span className="sep">/</span>
              <a href="/fr/glassware">{meta.breadcrumb}</a>
              <span className="sep">/</span>
              {childLabel}
            </div>
          </div>
        </section>

        <section className="block">
          <div className="wrap">
            <div className="shop-toolbar">
              <span className="count">{products.length} produit{products.length !== 1 ? 's' : ''}</span>
              <CategoryChips chips={chips} activeSlug={child.slug} allHref="/fr/glassware" />
            </div>
            <ProductGrid products={products} basePath={`/fr/glassware/${child.slug}`} />
          </div>
        </section>

        <SiteFooter />
      </>
    )
  }

  // Try slug as a product directly under the glassware parent
  const product = await getProductBySlug(subcategory)
  if (product && product.category_id === parent.id) {
    const related = await getRelatedProducts(parent.id, product.id)

    return (
      <>
        <ScrollReveal />
        <TopBar />
        <Header />
        <ProductDetailPage
          product={product}
          related={related}
          breadcrumbs={[{ label: meta.breadcrumb, href: '/fr/glassware' }]}
          basePath="/fr/glassware"
        />
        <SiteFooter />
      </>
    )
  }

  notFound()
}
```

- [ ] **Step 2: Update chemicals `[subcategory]/page.tsx`**

Replace entire file (open `app/src/app/[locale]/chemicals/[subcategory]/page.tsx`):

```tsx
import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import ProductGrid from '@/components/ProductGrid'
import CategoryChips from '@/components/CategoryChips'
import ProductDetailPage from '@/components/ProductDetailPage'
import {
  getCategoryBySlug,
  getChildCategories,
  getProductsByCategory,
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ subcategory: string }>
}

export default async function ChemicalsSubcategoryPage({ params }: Props) {
  const { subcategory } = await params
  const meta = CATEGORY_ROUTE_META.chemicals

  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS.chemicals)
  if (!parent) notFound()

  const child = await getCategoryBySlug(subcategory)
  if (child && child.parent_id === parent.id) {
    const siblings = await getChildCategories(parent.id)
    const products = await getProductsByCategory(child.id)

    const chips = siblings.map((c) => ({
      label: (c.name as { fr: string }).fr,
      href: `/fr/chemicals/${c.slug}`,
      slug: c.slug,
    }))

    const childLabel = (child.name as { fr: string }).fr

    return (
      <>
        <ScrollReveal />
        <TopBar />
        <Header />

        <section className="page-banner">
          <img className="bgimg" src={meta.bannerImage} alt="" />
          <div className="wrap">
            <h1>{childLabel}</h1>
            <div className="breadcrumb">
              <a href="/fr">Accueil</a>
              <span className="sep">/</span>
              <a href="/fr/chemicals">{meta.breadcrumb}</a>
              <span className="sep">/</span>
              {childLabel}
            </div>
          </div>
        </section>

        <section className="block">
          <div className="wrap">
            <div className="shop-toolbar">
              <span className="count">{products.length} produit{products.length !== 1 ? 's' : ''}</span>
              <CategoryChips chips={chips} activeSlug={child.slug} allHref="/fr/chemicals" />
            </div>
            <ProductGrid products={products} basePath={`/fr/chemicals/${child.slug}`} />
          </div>
        </section>

        <SiteFooter />
      </>
    )
  }

  const product = await getProductBySlug(subcategory)
  if (product && product.category_id === parent.id) {
    const related = await getRelatedProducts(parent.id, product.id)

    return (
      <>
        <ScrollReveal />
        <TopBar />
        <Header />
        <ProductDetailPage
          product={product}
          related={related}
          breadcrumbs={[{ label: meta.breadcrumb, href: '/fr/chemicals' }]}
          basePath="/fr/chemicals"
        />
        <SiteFooter />
      </>
    )
  }

  notFound()
}
```

- [ ] **Step 3: Update lab-equipment `[subcategory]/page.tsx`**

Replace entire file (open `app/src/app/[locale]/lab-equipment/[subcategory]/page.tsx`):

```tsx
import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import ProductGrid from '@/components/ProductGrid'
import CategoryChips from '@/components/CategoryChips'
import ProductDetailPage from '@/components/ProductDetailPage'
import {
  getCategoryBySlug,
  getChildCategories,
  getProductsByCategory,
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ subcategory: string }>
}

export default async function LabEquipmentSubcategoryPage({ params }: Props) {
  const { subcategory } = await params
  const meta = CATEGORY_ROUTE_META['lab-equipment']

  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS['lab-equipment'])
  if (!parent) notFound()

  const child = await getCategoryBySlug(subcategory)
  if (child && child.parent_id === parent.id) {
    const siblings = await getChildCategories(parent.id)
    const products = await getProductsByCategory(child.id)

    const chips = siblings.map((c) => ({
      label: (c.name as { fr: string }).fr,
      href: `/fr/lab-equipment/${c.slug}`,
      slug: c.slug,
    }))

    const childLabel = (child.name as { fr: string }).fr

    return (
      <>
        <ScrollReveal />
        <TopBar />
        <Header />

        <section className="page-banner">
          <img className="bgimg" src={meta.bannerImage} alt="" />
          <div className="wrap">
            <h1>{childLabel}</h1>
            <div className="breadcrumb">
              <a href="/fr">Accueil</a>
              <span className="sep">/</span>
              <a href="/fr/lab-equipment">{meta.breadcrumb}</a>
              <span className="sep">/</span>
              {childLabel}
            </div>
          </div>
        </section>

        <section className="block">
          <div className="wrap">
            <div className="shop-toolbar">
              <span className="count">{products.length} produit{products.length !== 1 ? 's' : ''}</span>
              <CategoryChips chips={chips} activeSlug={child.slug} allHref="/fr/lab-equipment" />
            </div>
            <ProductGrid products={products} basePath={`/fr/lab-equipment/${child.slug}`} />
          </div>
        </section>

        <SiteFooter />
      </>
    )
  }

  const product = await getProductBySlug(subcategory)
  if (product && product.category_id === parent.id) {
    const related = await getRelatedProducts(parent.id, product.id)

    return (
      <>
        <ScrollReveal />
        <TopBar />
        <Header />
        <ProductDetailPage
          product={product}
          related={related}
          breadcrumbs={[{ label: meta.breadcrumb, href: '/fr/lab-equipment' }]}
          basePath="/fr/lab-equipment"
        />
        <SiteFooter />
      </>
    )
  }

  notFound()
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add \
  "app/src/app/[locale]/glassware/[subcategory]/page.tsx" \
  "app/src/app/[locale]/chemicals/[subcategory]/page.tsx" \
  "app/src/app/[locale]/lab-equipment/[subcategory]/page.tsx"
git commit -m "feat(routing): detect product slugs in [subcategory] routes, render product page"
```

---

## Task 7: Create `[subcategory]/[product]/page.tsx` (3 files)

Products assigned to a child category live at `/fr/glassware/beakers/beaker-slug`.

**Files:**
- Create: `app/src/app/[locale]/glassware/[subcategory]/[product]/page.tsx`
- Create: `app/src/app/[locale]/chemicals/[subcategory]/[product]/page.tsx`
- Create: `app/src/app/[locale]/lab-equipment/[subcategory]/[product]/page.tsx`

- [ ] **Step 1: Create glassware `[subcategory]/[product]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import ProductDetailPage from '@/components/ProductDetailPage'
import {
  getCategoryBySlug,
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ subcategory: string; product: string }>
}

export default async function GlasswareProductPage({ params }: Props) {
  const { subcategory, product: productSlug } = await params
  const meta = CATEGORY_ROUTE_META.glassware

  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS.glassware)
  if (!parent) notFound()

  const child = await getCategoryBySlug(subcategory)
  if (!child || child.parent_id !== parent.id) notFound()

  const product = await getProductBySlug(productSlug)
  if (!product || product.category_id !== child.id) notFound()

  const related = await getRelatedProducts(child.id, product.id)
  const childLabel = (child.name as { fr: string }).fr

  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />
      <ProductDetailPage
        product={product}
        related={related}
        breadcrumbs={[
          { label: meta.breadcrumb, href: '/fr/glassware' },
          { label: childLabel, href: `/fr/glassware/${child.slug}` },
        ]}
        basePath={`/fr/glassware/${child.slug}`}
      />
      <SiteFooter />
    </>
  )
}
```

- [ ] **Step 2: Create chemicals `[subcategory]/[product]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import ProductDetailPage from '@/components/ProductDetailPage'
import {
  getCategoryBySlug,
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ subcategory: string; product: string }>
}

export default async function ChemicalsProductPage({ params }: Props) {
  const { subcategory, product: productSlug } = await params
  const meta = CATEGORY_ROUTE_META.chemicals

  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS.chemicals)
  if (!parent) notFound()

  const child = await getCategoryBySlug(subcategory)
  if (!child || child.parent_id !== parent.id) notFound()

  const product = await getProductBySlug(productSlug)
  if (!product || product.category_id !== child.id) notFound()

  const related = await getRelatedProducts(child.id, product.id)
  const childLabel = (child.name as { fr: string }).fr

  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />
      <ProductDetailPage
        product={product}
        related={related}
        breadcrumbs={[
          { label: meta.breadcrumb, href: '/fr/chemicals' },
          { label: childLabel, href: `/fr/chemicals/${child.slug}` },
        ]}
        basePath={`/fr/chemicals/${child.slug}`}
      />
      <SiteFooter />
    </>
  )
}
```

- [ ] **Step 3: Create lab-equipment `[subcategory]/[product]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import ProductDetailPage from '@/components/ProductDetailPage'
import {
  getCategoryBySlug,
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ subcategory: string; product: string }>
}

export default async function LabEquipmentProductPage({ params }: Props) {
  const { subcategory, product: productSlug } = await params
  const meta = CATEGORY_ROUTE_META['lab-equipment']

  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS['lab-equipment'])
  if (!parent) notFound()

  const child = await getCategoryBySlug(subcategory)
  if (!child || child.parent_id !== parent.id) notFound()

  const product = await getProductBySlug(productSlug)
  if (!product || product.category_id !== child.id) notFound()

  const related = await getRelatedProducts(child.id, product.id)
  const childLabel = (child.name as { fr: string }).fr

  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />
      <ProductDetailPage
        product={product}
        related={related}
        breadcrumbs={[
          { label: meta.breadcrumb, href: '/fr/lab-equipment' },
          { label: childLabel, href: `/fr/lab-equipment/${child.slug}` },
        ]}
        basePath={`/fr/lab-equipment/${child.slug}`}
      />
      <SiteFooter />
    </>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add \
  "app/src/app/[locale]/glassware/[subcategory]/[product]/page.tsx" \
  "app/src/app/[locale]/chemicals/[subcategory]/[product]/page.tsx" \
  "app/src/app/[locale]/lab-equipment/[subcategory]/[product]/page.tsx"
git commit -m "feat(routing): add [subcategory]/[product] pages for all 3 category families"
```

---

## Task 8: Manual smoke test

- [ ] **Step 1: Start dev server**

```bash
cd app && npm run dev
```

- [ ] **Step 2: Test product in subcategory**

Navigate to `/fr/glassware` → click a product card → should land on `/fr/glassware/[subcategory]/[slug]`.
Verify: image, name, description, variants (if any), "Demander un devis" button.

- [ ] **Step 3: Test product in parent category (no subcategory)**

Navigate to `/fr/lab-equipment` → click a product assigned directly to the parent → should land on `/fr/lab-equipment/[slug]`.
Verify: same layout, no variant section if no variants exist.

- [ ] **Step 4: Test quote modal**

Click "Demander un devis" → modal opens → fill form → submit → success message → modal closes after 3s.
Check terminal/server logs for `[QUOTE REQUEST]` output.

- [ ] **Step 5: Test 404**

Visit `/fr/glassware/this-slug-does-not-exist` → Next.js 404 page.

- [ ] **Step 6: Verify existing subcategory pages still work**

Navigate to `/fr/glassware/beakers` (or any known subcategory slug) → still renders subcategory product grid.

- [ ] **Step 7: Final commit if any fixes applied**

```bash
git add -p
git commit -m "fix(product-detail): smoke test fixes"
```

---

## Task 9: Update `live/state.md`

- [ ] **Step 1: Mark product detail page as done in state.md**

In `live/state.md`, move product detail page from "Next session" to the "What exists" section, and remove it from the blocking queue.

- [ ] **Step 2: Commit**

```bash
git add live/state.md
git commit -m "docs(state): mark product detail page as complete"
```
