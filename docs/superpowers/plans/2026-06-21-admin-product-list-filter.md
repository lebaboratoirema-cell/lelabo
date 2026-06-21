# Admin Product List Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add category + subcategory filter dropdowns to the admin products list page, with filter state in URL search params.

**Architecture:** `page.tsx` reads `searchParams` and filters the Supabase query server-side. A new `<FilterBar>` client component renders two `<select>` elements and drives URL navigation on change. No new dependencies.

**Tech Stack:** Next.js App Router (Server Components + Client Components), Supabase JS client, TypeScript, inline styles (existing pattern).

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `app/src/app/[locale]/admin/products/_components/FilterBar.tsx` | **Create** | Client component: two controlled selects, drives URL via `useRouter` |
| `app/src/app/[locale]/admin/products/page.tsx` | **Modify** | Add `searchParams` prop, fetch categories, apply conditional Supabase filter, render `<FilterBar>` |

---

### Task 1: Create FilterBar component

**Files:**
- Create: `app/src/app/[locale]/admin/products/_components/FilterBar.tsx`

- [ ] **Step 1: Create the file with full implementation**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/src/app/\[locale\]/admin/products/_components/FilterBar.tsx
git commit -m "feat: add FilterBar client component for admin product list"
```

---

### Task 2: Update page.tsx to read searchParams, fetch categories, filter products

**Files:**
- Modify: `app/src/app/[locale]/admin/products/page.tsx`

- [ ] **Step 1: Replace the full file content**

```tsx
import { createServiceClient } from '@/lib/supabase/service'
import type { Category } from '@/types/database'
import DeleteButton from './_components/DeleteButton'
import FilterBar from './_components/FilterBar'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; subcategory?: string }
}) {
  const supabase = createServiceClient()

  const { data: allCats } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('position')

  const parents = ((allCats ?? []) as Category[]).filter((c) => !c.parent_id)
  const childCategories = ((allCats ?? []) as Category[]).filter((c) => !!c.parent_id)

  const categoryParam = searchParams.category ?? ''
  const subcategoryParam = searchParams.subcategory ?? ''

  let query = supabase
    .from('products')
    .select('*, categories(name), product_variants(id)')
    .order('created_at', { ascending: false })

  if (subcategoryParam) {
    query = query.eq('category_id', subcategoryParam)
  } else if (categoryParam) {
    const childIds = childCategories
      .filter((c) => c.parent_id === categoryParam)
      .map((c) => c.id)
    query = query.in('category_id', [categoryParam, ...childIds])
  }

  const { data: products } = await query

  return (
    <div style={{ padding: '32px 32px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Spectral, serif', fontSize: 32, fontWeight: 600, letterSpacing: '-0.3px', color: '#1c2230' }}>Produits</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#8a8478' }}>{products?.length ?? 0} produit{(products?.length ?? 0) !== 1 ? 's' : ''}</p>
        </div>
        <a
          href="/fr/admin/products/new"
          style={{ height: 44, padding: '0 22px', border: 'none', borderRadius: 11, background: '#1c2b46', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(28,43,70,0.2)', textDecoration: 'none' }}
        >
          + Nouveau produit
        </a>
      </div>

      <FilterBar
        parents={parents}
        children={childCategories}
        selectedCategory={categoryParam}
        selectedSubcategory={subcategoryParam}
      />

      {(!products || products.length === 0) ? (
        <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: '48px 28px', textAlign: 'center', color: '#8a8478' }}>
          <p style={{ margin: '0 0 16px', fontSize: 15 }}>Aucun produit pour le moment.</p>
          <a href="/fr/admin/products/new" style={{ fontSize: 14, fontWeight: 600, color: '#c8643c', textDecoration: 'none' }}>Créer le premier produit →</a>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(28,34,48,0.04)' }}>
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0ede5' }}>
                {['Nom', 'Catégorie', 'Marque', 'Variantes', 'Statut', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: i >= 3 && i < 5 ? 'center' : i === 5 ? 'right' : 'left', padding: '14px 20px', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a8a294', background: '#faf9f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p: any, idx: number) => (
                <tr key={p.id} style={{ borderBottom: idx < products.length - 1 ? '1px solid #f4f2ec' : 'none' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#1c2230' }}>{p.name?.fr ?? '—'}</td>
                  <td style={{ padding: '16px 20px', color: '#6b6357' }}>{p.categories?.name?.fr ?? '—'}</td>
                  <td style={{ padding: '16px 20px', color: '#8a8478' }}>{p.brand ?? '—'}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', color: '#6b6357', fontWeight: 600 }}>{p.product_variants?.length ?? 0}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: p.is_active ? '#e8f4e8' : '#f4f2ec', color: p.is_active ? '#2e7d32' : '#8a8478' }}>
                      {p.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                      <a href={`/fr/admin/products/${p.id}/edit`} style={{ fontSize: 13, fontWeight: 600, color: '#1c2b46', textDecoration: 'none' }}>Modifier</a>
                      <DeleteButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```

Expected: no errors. If errors on `searchParams` typing, check that the Next.js version in this project expects `Promise<{...}>` vs direct object — read `node_modules/next/dist/docs/` as instructed in `app/AGENTS.md`.

- [ ] **Step 3: Commit**

```bash
git add app/src/app/\[locale\]/admin/products/page.tsx
git commit -m "feat: filter admin product list by category and subcategory via URL params"
```

---

### Task 3: Manual verification

- [ ] **Step 1: Start dev server**

```bash
cd app && npm run dev
```

- [ ] **Step 2: Open `/fr/admin/products`**

Verify: two-column layout unchanged, "Toutes les catégories" dropdown visible, no subcategory dropdown yet, product count shows all products.

- [ ] **Step 3: Select a parent category (e.g. Chimie)**

Verify: URL updates to `?category=<uuid>`, product list narrows to products in that category family, subcategory dropdown appears (if children exist).

- [ ] **Step 4: Select a subcategory**

Verify: URL updates to `?category=<uuid>&subcategory=<uuid>`, product list narrows further to only that subcategory.

- [ ] **Step 5: Select "Toutes les sous-catégories"**

Verify: URL returns to `?category=<uuid>` only, product list expands back to full parent family.

- [ ] **Step 6: Select "Toutes les catégories"**

Verify: URL clears params, all products shown.
