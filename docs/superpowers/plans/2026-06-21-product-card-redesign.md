# Product Card Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify public product grid cards to show only image, name, and stock availability; add optional admin-controlled promo badge (top-left, red) per card.

**Architecture:** Two new columns (`in_stock`, `promo_label`) added to the `products` table via Supabase SQL migration. TypeScript types updated. `ProductGrid.tsx` stripped of description/price/brand and given two overlay badges. Admin `ProductForm.tsx` and `actions.ts` wired to expose and persist both fields.

**Tech Stack:** Next.js 15+, Supabase (PostgreSQL), TypeScript, inline CSS (project style), no test framework present — verify manually via dev server.

---

### Task 1: Run DB migration in Supabase

**Files:**
- No code file — run SQL in Supabase dashboard (SQL editor)

- [ ] **Step 1: Open Supabase SQL editor**

Navigate to your Supabase project → SQL Editor → New query.

- [ ] **Step 2: Run migration**

```sql
ALTER TABLE products
  ADD COLUMN in_stock boolean NOT NULL DEFAULT false,
  ADD COLUMN promo_label varchar(20) NULL;
```

Expected: "Success. No rows returned."

- [ ] **Step 3: Verify columns exist**

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('in_stock', 'promo_label');
```

Expected: 2 rows — `in_stock` (boolean, NOT NULL, false) and `promo_label` (character varying, YES, null).

---

### Task 2: Update TypeScript types

**Files:**
- Modify: `app/src/types/database.ts`

- [ ] **Step 1: Add fields to `Product` interface**

In `app/src/types/database.ts`, find the `Product` interface and add two fields after `is_active`:

```typescript
export interface Product {
  id: string
  category_id: string
  slug: string
  name: LocalizedText
  description: LocalizedText | null
  brand: string | null
  is_active: boolean
  in_stock: boolean
  promo_label: string | null
  created_at: string
  updated_at: string
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/types/database.ts
git commit -m "feat: add in_stock and promo_label to Product type"
```

---

### Task 3: Add CSS for promo and stock badges

**Files:**
- Modify: `app/src/app/globals.css`

- [ ] **Step 1: Add badge styles after `.product-card .price small` block**

In `app/src/app/globals.css`, find the line:
```css
.product-card .price small { font-weight: 400; color: var(--muted); font-size: 12px; }
```

Add immediately after it:

```css
.product-card .promo-badge {
  position: absolute; top: 14px; left: 14px;
  background: #dc2626; color: #fff;
  font-size: 12px; font-weight: 700;
  padding: 5px 10px; border-radius: 30px; z-index: 1;
}
.product-card .stock-badge {
  position: absolute; bottom: 12px; left: 14px;
  background: rgba(255,255,255,.92);
  font-size: 11px; font-weight: 600;
  padding: 5px 10px; border-radius: 30px;
  display: flex; align-items: center; gap: 6px; z-index: 1;
}
.product-card .stock-badge .sdot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/app/globals.css
git commit -m "feat: add promo-badge and stock-badge CSS for product cards"
```

---

### Task 4: Rewrite ProductGrid card markup

**Files:**
- Modify: `app/src/components/ProductGrid.tsx`

- [ ] **Step 1: Replace file contents**

Replace `app/src/components/ProductGrid.tsx` with:

```typescript
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
              {p.promo_label && (
                <span className="promo-badge">{p.promo_label}</span>
              )}
              <img src={imgSrc} alt={(p.name as { fr: string }).fr} />
              <span className="stock-badge">
                <span className="sdot" style={{ background: p.in_stock ? '#16a34a' : '#9ca3af' }} />
                {p.in_stock ? 'En stock' : 'Sur commande'}
              </span>
            </div>
            <div className="pbody">
              <h3>{(p.name as { fr: string }).fr}</h3>
            </div>
          </a>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Verify in browser**

Start dev server (`npm run dev` inside `app/`). Open any category page (e.g. `/fr/chemicals`). Confirm:
- Cards show only image + name
- No description, no "Sur demande", no brand tag
- Stock badge appears bottom-left of image (gray "Sur commande" for existing products since `in_stock` defaults to false)
- No promo badge (none set yet)

- [ ] **Step 4: Commit**

```bash
git add app/src/components/ProductGrid.tsx
git commit -m "feat: simplify product card — name + image + stock + promo badge only"
```

---

### Task 5: Add in_stock and promo_label to admin ProductForm

**Files:**
- Modify: `app/src/app/[locale]/admin/products/_components/ProductForm.tsx`

- [ ] **Step 1: Add state variables**

In `ProductForm.tsx`, find the existing state declarations block (around line 29–32). Add two new state variables after `const [active, setActive]`:

```typescript
const [inStock, setInStock] = useState(product?.in_stock ?? false)
const [promoLabel, setPromoLabel] = useState(product?.promo_label ?? '')
```

- [ ] **Step 2: Wire fields into FormData in handleSubmit**

In `handleSubmit`, find the lines that set `is_active`, `desc_fr`, `category_id` (around lines 71–73). Add after them:

```typescript
fd.set('in_stock', inStock ? 'on' : '')
fd.set('promo_label', promoLabel.trim())
```

- [ ] **Step 3: Add UI fields to sidebar Statut card**

In the sidebar `<section>` for "Statut" (around line 252), find the divider `<div style={{ height: 1, background: '#f0ede5', margin: '20px 0' }} />` and the stats block below it. Add a second divider and the two new fields after the stats block, before the closing `</section>`:

```tsx
<div style={{ height: 1, background: '#f0ede5', margin: '20px 0' }} />

{/* En stock toggle */}
<div
  onClick={() => setInStock((s) => !s)}
  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: 16 }}
>
  <div>
    <div style={{ fontSize: 14, fontWeight: 600 }}>{inStock ? 'En stock' : 'Sur commande'}</div>
    <div style={{ fontSize: 12, color: '#a8a294', marginTop: 2 }}>Disponibilité produit</div>
  </div>
  <div style={{ width: 46, height: 26, borderRadius: 13, background: inStock ? '#16a34a' : '#d4d0c6', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, left: inStock ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
  </div>
</div>

{/* Promo label */}
<div>
  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7, color: '#3a4150' }}>
    Badge promo
  </label>
  <input
    type="text"
    value={promoLabel}
    onChange={(e) => setPromoLabel(e.target.value.slice(0, 20))}
    placeholder="-25%"
    maxLength={20}
    style={{ height: 40, padding: '0 12px', border: '1px solid #dcd8cf', borderRadius: 9, background: '#fcfbf9', fontSize: 13, color: '#1c2230', fontFamily: 'inherit', width: '100%' }}
  />
  <p style={{ margin: '6px 0 0', fontSize: 11, color: '#a8a294' }}>Laisser vide pour masquer.</p>
</div>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Verify in browser**

Open `/fr/admin/products/new`. Confirm:
- "En stock" toggle appears in sidebar below stats
- "Badge promo" text input appears below toggle
- Toggle switches between green "En stock" and gray "Sur commande"

- [ ] **Step 6: Commit**

```bash
git add app/src/app/[locale]/admin/products/_components/ProductForm.tsx
git commit -m "feat: add in_stock toggle and promo_label input to admin product form"
```

---

### Task 6: Persist in_stock and promo_label in server actions

**Files:**
- Modify: `app/src/app/[locale]/admin/products/_components/actions.ts`

- [ ] **Step 1: Add fields to createProduct insert**

In `actions.ts`, find the `.insert({` block inside `createProduct` (around line 54). Add two fields after `is_active`:

```typescript
const { data: product, error } = await supabase
  .from('products')
  .insert({
    category_id: formData.get('category_id') as string,
    slug,
    name: { fr: nameFr },
    description: { fr: formData.get('desc_fr') as string || null },
    brand: (formData.get('brand') as string) || null,
    is_active: formData.get('is_active') === 'on',
    in_stock: formData.get('in_stock') === 'on',
    promo_label: (formData.get('promo_label') as string) || null,
  })
  .select('id')
  .single()
```

- [ ] **Step 2: Add fields to updateProduct update**

In `actions.ts`, find the `.update({` block inside `updateProduct` (around line 90). Add two fields after `is_active`:

```typescript
const { error } = await supabase
  .from('products')
  .update({
    category_id: formData.get('category_id') as string,
    name: { fr: nameFr },
    description: { fr: formData.get('desc_fr') as string || null },
    brand: (formData.get('brand') as string) || null,
    is_active: formData.get('is_active') === 'on',
    in_stock: formData.get('in_stock') === 'on',
    promo_label: (formData.get('promo_label') as string) || null,
  })
  .eq('id', id)
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: End-to-end test**

1. Open `/fr/admin/products/new`, create a test product with "En stock" toggled ON and badge promo set to `-25%`.
2. Submit. Confirm redirect to product list.
3. Open a category page that contains the product. Confirm card shows:
   - Red `-25%` badge top-left of image
   - Green "En stock" badge bottom-left of image
   - Product name only in body
4. Edit the product, set "En stock" OFF and clear badge promo. Save.
5. Confirm card now shows gray "Sur commande" and no promo badge.

- [ ] **Step 5: Commit**

```bash
git add app/src/app/[locale]/admin/products/_components/actions.ts
git commit -m "feat: persist in_stock and promo_label in product create/update actions"
```
