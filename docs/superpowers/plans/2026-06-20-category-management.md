# Category Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full category CRUD to the admin dashboard and a "Nouvelle catégorie" link in the product form.

**Architecture:** Mirror the existing products admin pattern — server component pages, a shared `CategoryForm` client component, and server actions. Extract the existing `slugify` function to a shared util. Update the admin nav to dynamically highlight the active section.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase (service role), Tailwind v4 (inline styles — no class usage in admin components), `next/navigation` for `usePathname`.

**All commands run from:** `app/` directory.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/lib/slugify.ts` | Shared slugify util |
| Modify | `src/app/[locale]/admin/products/_components/actions.ts` | Import slugify from shared util |
| Create | `src/app/[locale]/admin/categories/_components/actions.ts` | Category server actions |
| Create | `src/app/[locale]/admin/categories/_components/DeleteCategoryButton.tsx` | Client delete with confirm |
| Create | `src/app/[locale]/admin/categories/_components/CategoryForm.tsx` | Client form (create + edit) |
| Create | `src/app/[locale]/admin/categories/page.tsx` | Category list (server) |
| Create | `src/app/[locale]/admin/categories/new/page.tsx` | Create page shell (server) |
| Create | `src/app/[locale]/admin/categories/[id]/edit/page.tsx` | Edit page shell (server) |
| Create | `src/app/[locale]/admin/_components/AdminNav.tsx` | Client nav with active state |
| Modify | `src/app/[locale]/admin/layout.tsx` | Use AdminNav client component |
| Modify | `src/app/[locale]/admin/products/_components/ProductForm.tsx` | Add "+ Nouvelle catégorie ↗" link |

---

## Task 1: Extract `slugify` to shared util

**Files:**
- Create: `src/lib/slugify.ts`
- Modify: `src/app/[locale]/admin/products/_components/actions.ts`

- [ ] **Step 1: Create shared slugify util**

Create `src/lib/slugify.ts`:

```typescript
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
```

- [ ] **Step 2: Update products actions to import from shared util**

In `src/app/[locale]/admin/products/_components/actions.ts`, replace the local `slugify` function definition with an import:

Remove lines 7–13 (the local `function slugify(text: string) { ... }`) and add at the top after `'use server'`:

```typescript
import { slugify } from '@/lib/slugify'
```

- [ ] **Step 3: Verify build still passes**

```bash
npm run build
```

Expected: Build completes with no TypeScript errors. If errors, check the import path resolves — `@/` maps to `src/` per the project's `tsconfig.json`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/slugify.ts src/app/[locale]/admin/products/_components/actions.ts
git commit -m "refactor(admin): extract slugify to shared lib"
```

---

## Task 2: Category server actions

**Files:**
- Create: `src/app/[locale]/admin/categories/_components/actions.ts`

- [ ] **Step 1: Create actions file**

Create `src/app/[locale]/admin/categories/_components/actions.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { slugify } from '@/lib/slugify'

export async function createCategory(formData: FormData) {
  const supabase = createServiceClient()
  const nameFr = formData.get('name_fr') as string
  const slug = (formData.get('slug') as string).trim() || slugify(nameFr)
  const parentId = (formData.get('parent_id') as string) || null

  const { error } = await supabase.from('categories').insert({
    name: { fr: nameFr },
    slug,
    parent_id: parentId,
    is_active: formData.get('is_active') === 'on',
    position: 0,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
  redirect('/fr/admin/categories')
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = createServiceClient()
  const nameFr = formData.get('name_fr') as string
  const slug = (formData.get('slug') as string).trim()
  const parentId = (formData.get('parent_id') as string) || null

  const { error } = await supabase
    .from('categories')
    .update({
      name: { fr: nameFr },
      slug,
      parent_id: parentId,
      is_active: formData.get('is_active') === 'on',
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
  redirect('/fr/admin/categories')
}

export async function deleteCategory(id: string) {
  const supabase = createServiceClient()

  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (count && count > 0) {
    throw new Error(
      `Cette catégorie contient ${count} produit(s). Réaffectez-les avant de supprimer.`
    )
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors. Fix any type issues before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/admin/categories/_components/actions.ts
git commit -m "feat(admin): add category server actions"
```

---

## Task 3: DeleteCategoryButton

**Files:**
- Create: `src/app/[locale]/admin/categories/_components/DeleteCategoryButton.tsx`

- [ ] **Step 1: Create component**

Create `src/app/[locale]/admin/categories/_components/DeleteCategoryButton.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { deleteCategory } from './actions'

export default function DeleteCategoryButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (!confirm('Supprimer cette catégorie ?')) return
    setLoading(true)
    setError(null)
    try {
      await deleteCategory(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <p style={{ fontSize: 12, color: '#b5503a', margin: '4px 0 0' }}>{error}</p>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          height: 34,
          padding: '0 14px',
          border: '1px solid #ece9e1',
          borderRadius: 9,
          background: '#fff',
          color: loading ? '#a8a294' : '#b5503a',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'inherit',
        }}
      >
        {loading ? 'Suppression…' : 'Supprimer'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/admin/categories/_components/DeleteCategoryButton.tsx
git commit -m "feat(admin): add DeleteCategoryButton component"
```

---

## Task 4: CategoryForm

**Files:**
- Create: `src/app/[locale]/admin/categories/_components/CategoryForm.tsx`

- [ ] **Step 1: Create component**

Create `src/app/[locale]/admin/categories/_components/CategoryForm.tsx`:

```typescript
'use client'

import { useState, useRef } from 'react'
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
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 32px 100px' }}>

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
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#a8a294' }}>Les champs marqués <span style={{ color: '#c8643c' }}>*</span> sont obligatoires.</span>
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/admin/categories/_components/CategoryForm.tsx
git commit -m "feat(admin): add CategoryForm component"
```

---

## Task 5: Category list page

**Files:**
- Create: `src/app/[locale]/admin/categories/page.tsx`

- [ ] **Step 1: Create list page**

Create `src/app/[locale]/admin/categories/page.tsx`:

```typescript
import { createServiceClient } from '@/lib/supabase/service'
import DeleteCategoryButton from './_components/DeleteCategoryButton'
import type { Category } from '@/types/database'

export default async function CategoriesPage() {
  const supabase = createServiceClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('position')
    .order('created_at')

  const rows = (categories ?? []) as Category[]
  const parentMap = new Map(rows.map((c) => [c.id, (c.name as { fr: string }).fr]))

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 32px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Spectral, serif', fontSize: 32, fontWeight: 600, letterSpacing: '-0.3px' }}>Catégories</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#8a8478' }}>{rows.length} catégorie{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <a
          href="/fr/admin/categories/new"
          style={{ height: 44, padding: '0 22px', border: 'none', borderRadius: 11, background: '#1c2b46', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', textDecoration: 'none', boxShadow: '0 4px 14px rgba(28,43,70,0.2)' }}
        >
          + Nouvelle catégorie
        </a>
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#a8a294', fontSize: 14 }}>
          Aucune catégorie — <a href="/fr/admin/categories/new" style={{ color: '#c8643c', textDecoration: 'none', fontWeight: 600 }}>Créer la première</a>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(28,34,48,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0ede5' }}>
                {['Nom', 'Slug', 'Parente', 'Statut', ''].map((h) => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a8a294' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f7f5f1' : 'none' }}>
                  <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: '#1c2230' }}>
                    {(c.name as { fr: string }).fr}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontFamily: 'ui-monospace, monospace', color: '#6b6357' }}>
                    {c.slug}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#8a8478' }}>
                    {c.parent_id ? parentMap.get(c.parent_id) ?? '—' : '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: c.is_active ? '#edf7ed' : '#f5f4f0', color: c.is_active ? '#2e7d32' : '#8a8478' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.is_active ? '#43a047' : '#c5c0b5', display: 'inline-block' }} />
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                      <a
                        href={`/fr/admin/categories/${c.id}/edit`}
                        style={{ height: 34, padding: '0 14px', border: '1px solid #dcd8cf', borderRadius: 9, background: '#fff', fontSize: 13, fontWeight: 600, color: '#1c2b46', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                      >
                        Modifier
                      </a>
                      <DeleteCategoryButton id={c.id} />
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

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/admin/categories/page.tsx
git commit -m "feat(admin): add category list page"
```

---

## Task 6: Category create and edit pages

**Files:**
- Create: `src/app/[locale]/admin/categories/new/page.tsx`
- Create: `src/app/[locale]/admin/categories/[id]/edit/page.tsx`

- [ ] **Step 1: Create the new category page**

Create `src/app/[locale]/admin/categories/new/page.tsx`:

```typescript
import { createServiceClient } from '@/lib/supabase/service'
import CategoryForm from '../_components/CategoryForm'
import type { Category } from '@/types/database'

export default async function NewCategoryPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .order('position')

  const categories = (data ?? []) as Pick<Category, 'id' | 'name'>[]

  return <CategoryForm categories={categories as Category[]} />
}
```

- [ ] **Step 2: Create the edit category page**

Create `src/app/[locale]/admin/categories/[id]/edit/page.tsx`:

```typescript
import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import CategoryForm from '../../_components/CategoryForm'
import type { Category } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()

  const [{ data: category }, { data: allCategories }] = await Promise.all([
    supabase.from('categories').select('*').eq('id', id).single(),
    supabase.from('categories').select('id, name').order('position'),
  ])

  if (!category) notFound()

  // Exclude self from parent options to prevent circular references
  const parentOptions = ((allCategories ?? []) as Category[]).filter((c) => c.id !== id)

  return <CategoryForm categories={parentOptions} category={category as Category} />
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors. Note: `params` is a `Promise` in Next.js 16 — the `await params` pattern is required.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/admin/categories/new/page.tsx src/app/[locale]/admin/categories/[id]/edit/page.tsx
git commit -m "feat(admin): add category create and edit pages"
```

---

## Task 7: Admin nav with active state

**Files:**
- Create: `src/app/[locale]/admin/_components/AdminNav.tsx`
- Modify: `src/app/[locale]/admin/layout.tsx`

- [ ] **Step 1: Create AdminNav client component**

Create `src/app/[locale]/admin/_components/AdminNav.tsx`:

```typescript
'use client'

import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()

  function linkStyle(href: string): React.CSSProperties {
    const active = pathname.startsWith(href)
    return {
      color: active ? '#1c2b46' : '#9aa3af',
      fontWeight: active ? 600 : 400,
      textDecoration: 'none',
      position: 'relative',
    }
  }

  function underline(href: string): React.CSSProperties {
    return {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: -21,
      height: 2,
      background: '#c8643c',
      borderRadius: 2,
      display: pathname.startsWith(href) ? 'block' : 'none',
    }
  }

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14 }}>
      <a href="/fr/admin" style={{ color: pathname === '/fr/admin' ? '#1c2b46' : '#9aa3af', fontWeight: pathname === '/fr/admin' ? 600 : 400, textDecoration: 'none', position: 'relative' }}>
        Tableau de bord
        <span style={underline('/fr/admin')} />
      </a>
      <a href="/fr/admin/products" style={linkStyle('/fr/admin/products')}>
        Produits
        <span style={underline('/fr/admin/products')} />
      </a>
      <a href="/fr/admin/categories" style={linkStyle('/fr/admin/categories')}>
        Catégories
        <span style={underline('/fr/admin/categories')} />
      </a>
      <span style={{ color: '#9aa3af', cursor: 'not-allowed' }}>Commandes</span>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#e2ddd2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#6b6357' }}>SA</div>
    </nav>
  )
}
```

- [ ] **Step 2: Update layout.tsx to use AdminNav**

In `src/app/[locale]/admin/layout.tsx`, replace the entire `<nav>` block (lines 25–33) with:

```tsx
import AdminNav from './_components/AdminNav'
```

Add this import at the top of the file, then replace the `<nav ...>...</nav>` block with:

```tsx
<AdminNav />
```

The full updated `layout.tsx`:

```typescript
import AdminNav from './_components/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Spectral:wght@500;600&display=swap" rel="stylesheet" />
      <style>{`
        .admin-root { font-family: 'Instrument Sans', system-ui, sans-serif; }
        .admin-input:focus { outline: none; border-color: #1c2b46 !important; box-shadow: 0 0 0 3px rgba(28,43,70,0.08); background: #fff !important; }
        .admin-btn-ghost:hover { background: #f6f4ef; }
        .admin-btn-add:hover { border-color: #c8643c; color: #c8643c; background: #fdf6f2; }
        .admin-add-img:hover { border-color: #c8643c !important; color: #c8643c !important; background: #fdf6f2 !important; }
        .admin-remove-btn:hover { background: #fdf1ed; border-color: #e6c3b8; }
        .admin-select:focus { outline: none; border-color: #1c2b46 !important; box-shadow: 0 0 0 3px rgba(28,43,70,0.08); background: #fff !important; }
      `}</style>
      <div className="admin-root" style={{ minHeight: '100vh', background: '#f4f3ef', color: '#1c2230', WebkitFontSmoothing: 'antialiased' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e6e3db' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#1c2b46', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Spectral, serif', fontSize: 16, fontWeight: 600 }}>L</div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontFamily: 'Spectral, serif', fontSize: 16, fontWeight: 600, letterSpacing: '0.2px' }}>Le Laboratoire</span>
              <span style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9aa3af' }}>Admin</span>
            </div>
          </div>
          <AdminNav />
        </header>
        <main>{children}</main>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/admin/_components/AdminNav.tsx src/app/[locale]/admin/layout.tsx
git commit -m "feat(admin): add dynamic nav with Catégories link"
```

---

## Task 8: ProductForm — "Nouvelle catégorie" link

**Files:**
- Modify: `src/app/[locale]/admin/products/_components/ProductForm.tsx`

- [ ] **Step 1: Replace the category label div**

In `ProductForm.tsx`, find this block at line ~122:

```tsx
<label style={label}>Catégorie <span style={{ color: '#c8643c' }}>*</span></label>
```

Replace with:

```tsx
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Manual verification**

```bash
npm run dev
```

Navigate to `http://localhost:3000/fr/admin/products/new`:
- Confirm "Catégorie" label shows "+ Nouvelle catégorie ↗" link to the right
- Click the link — new tab opens at `/fr/admin/categories/new`
- Fill in name (slug auto-fills), click create — redirects to `/fr/admin/categories`
- Category appears in the list
- Return to product form tab, refresh — new category appears in the dropdown

Also verify at `/fr/admin/categories`:
- Nav highlights "Catégories" with orange underline
- List shows all categories with Modifier / Supprimer actions
- Edit works (pre-fills form, self excluded from parent options)
- Delete blocked when products are assigned (error message shown)
- Delete succeeds for unused category

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/admin/products/_components/ProductForm.tsx
git commit -m "feat(admin): add nouvelle catégorie link to product form"
```

---

## Done

All tasks complete. The admin has full category CRUD at `/fr/admin/categories`, the nav highlights the active section, and the product form links to category creation in a new tab.
