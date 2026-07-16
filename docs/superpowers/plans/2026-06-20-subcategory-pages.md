# Subcategory Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add database-driven subcategory pages under `/fr/chemicals`, `/fr/glassware`, and `/fr/lab-equipment` so clicking a category chip navigates to a filtered product page.

**Architecture:** Each top-level category page maps to a DB slug via a single config file. A shared `queries.ts` module fetches categories and products from Supabase. Two shared components (`ProductGrid`, `CategoryChips`) are reused across parent and subcategory pages. Subcategory pages are dynamic routes (`[subcategory]/page.tsx`) under each category directory.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase (via `@supabase/ssr`), Tailwind v4

---

## File Map

**Create:**
- `app/src/lib/categoryRoutes.ts` — slug-to-URL mapping + page display meta
- `app/src/lib/supabase/queries.ts` — `getCategoryBySlug`, `getChildCategories`, `getProductsByCategory`
- `app/src/components/ProductGrid.tsx` — shared product card grid (server component)
- `app/src/components/CategoryChips.tsx` — shared chip nav (server component)
- `app/src/app/[locale]/chemicals/[subcategory]/page.tsx`
- `app/src/app/[locale]/glassware/[subcategory]/page.tsx`
- `app/src/app/[locale]/lab-equipment/[subcategory]/page.tsx`

**Modify:**
- `app/src/app/[locale]/chemicals/page.tsx` — remove static array, wire DB
- `app/src/app/[locale]/glassware/page.tsx` — same
- `app/src/app/[locale]/lab-equipment/page.tsx` — same

---

## Task 1: Verify DB slugs and create categoryRoutes.ts

**Files:**
- Create: `app/src/lib/categoryRoutes.ts`

- [ ] **Step 1: Query Supabase for top-level category slugs**

  Open the Supabase dashboard → SQL Editor and run:
  ```sql
  SELECT slug, name FROM categories WHERE parent_id IS NULL ORDER BY position;
  ```
  Note the exact slug values returned — you'll need them in the next step.

- [ ] **Step 2: Create categoryRoutes.ts with the real slugs**

  Replace `'FILL_FROM_DB'` with the actual slug values you found:

  ```ts
  // app/src/lib/categoryRoutes.ts

  export const CATEGORY_ROUTE_SLUGS = {
    chemicals: 'FILL_FROM_DB',      // e.g. 'produits-chimiques'
    glassware: 'FILL_FROM_DB',      // e.g. 'verrerie'
    'lab-equipment': 'FILL_FROM_DB', // e.g. 'equipements'
  } as const

  export type CategoryRoute = keyof typeof CATEGORY_ROUTE_SLUGS

  export const CATEGORY_ROUTE_META: Record<CategoryRoute, {
    title: string
    breadcrumb: string
    bannerImage: string
  }> = {
    chemicals: {
      title: 'Produits chimiques',
      breadcrumb: 'Chimie',
      bannerImage: '/images/hero-chem.jpg',
    },
    glassware: {
      title: 'Verrerie & consommables',
      breadcrumb: 'Verrerie',
      bannerImage: '/images/glassware.jpg',
    },
    'lab-equipment': {
      title: 'Équipements de laboratoire',
      breadcrumb: 'Équipements',
      bannerImage: '/images/hero-tech.jpg',
    },
  }
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add app/src/lib/categoryRoutes.ts
  git commit -m "feat: add category route slug config"
  ```

---

## Task 2: Create queries.ts

**Files:**
- Create: `app/src/lib/supabase/queries.ts`

- [ ] **Step 1: Create the queries module**

  ```ts
  // app/src/lib/supabase/queries.ts
  import { createClient } from './server'
  import type { Category, Product, ProductImage } from '@/types/database'

  export type ProductWithImage = Product & {
    product_images: Pick<ProductImage, 'storage_path' | 'is_primary'>[]
  }

  export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const supabase = await createClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    return data ?? null
  }

  export async function getChildCategories(parentId: string): Promise<Category[]> {
    const supabase = await createClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .eq('is_active', true)
      .order('position')
    return data ?? []
  }

  export async function getProductsByCategory(categoryId: string): Promise<ProductWithImage[]> {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*, product_images(storage_path, is_primary)')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    return (data as ProductWithImage[]) ?? []
  }
  ```

- [ ] **Step 2: Check TypeScript compiles**

  ```bash
  cd app && npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add app/src/lib/supabase/queries.ts
  git commit -m "feat: add supabase query helpers for category pages"
  ```

---

## Task 3: Create ProductGrid component

**Files:**
- Create: `app/src/components/ProductGrid.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  // app/src/components/ProductGrid.tsx
  import type { ProductWithImage } from '@/lib/supabase/queries'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  function getImageUrl(storagePath: string): string {
    return `${supabaseUrl}/storage/v1/object/public/product-images/${storagePath}`
  }

  export default function ProductGrid({ products }: { products: ProductWithImage[] }) {
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
            <div className="product-card reveal" key={p.id}>
              <div className="pimg">
                <img src={imgSrc} alt={(p.name as { fr: string }).fr} />
                {p.brand && <span className="tag">{p.brand}</span>}
              </div>
              <div className="pbody">
                <h3>{(p.name as { fr: string }).fr}</h3>
                <p>{(p.description as { fr?: string } | null)?.fr ?? ''}</p>
                <div className="pfoot">
                  <span className="price">Sur demande</span>
                  <a href="/fr/contact" className="btn btn-sm">Demander un devis</a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
  ```

- [ ] **Step 2: Check TypeScript compiles**

  ```bash
  cd app && npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add app/src/components/ProductGrid.tsx
  git commit -m "feat: add shared ProductGrid server component"
  ```

---

## Task 4: Create CategoryChips component

**Files:**
- Create: `app/src/components/CategoryChips.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  // app/src/components/CategoryChips.tsx

  interface Chip {
    label: string
    href: string
    slug: string | null  // null = "Tous" chip
  }

  interface Props {
    chips: Chip[]
    activeSlug: string | null  // null = "Tous" is active
    allHref: string
  }

  export default function CategoryChips({ chips, activeSlug, allHref }: Props) {
    return (
      <div className="chips">
        <a
          href={allHref}
          className={`chip${activeSlug === null ? ' active' : ''}`}
        >
          Tous
        </a>
        {chips.map((chip) => (
          <a
            key={chip.slug}
            href={chip.href}
            className={`chip${activeSlug === chip.slug ? ' active' : ''}`}
          >
            {chip.label}
          </a>
        ))}
      </div>
    )
  }
  ```

- [ ] **Step 2: Check TypeScript compiles**

  ```bash
  cd app && npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add app/src/components/CategoryChips.tsx
  git commit -m "feat: add shared CategoryChips server component"
  ```

---

## Task 5: Update chemicals/page.tsx

**Files:**
- Modify: `app/src/app/[locale]/chemicals/page.tsx`

- [ ] **Step 1: Replace the file contents**

  ```tsx
  // app/src/app/[locale]/chemicals/page.tsx
  import { notFound } from 'next/navigation'
  import TopBar from '@/components/TopBar'
  import Header from '@/components/Header'
  import SiteFooter from '@/components/SiteFooter'
  import ScrollReveal from '@/components/ScrollReveal'
  import ProductGrid from '@/components/ProductGrid'
  import CategoryChips from '@/components/CategoryChips'
  import {
    getCategoryBySlug,
    getChildCategories,
    getProductsByCategory,
  } from '@/lib/supabase/queries'
  import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

  export default async function ChemicalsPage() {
    const meta = CATEGORY_ROUTE_META.chemicals
    const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS.chemicals)
    if (!parent) notFound()

    const children = await getChildCategories(parent.id)

    const allProducts = children.length > 0
      ? (await Promise.all(children.map((c) => getProductsByCategory(c.id)))).flat()
      : await getProductsByCategory(parent.id)

    const chips = children.map((c) => ({
      label: (c.name as { fr: string }).fr,
      href: `/fr/chemicals/${c.slug}`,
      slug: c.slug,
    }))

    return (
      <>
        <ScrollReveal />
        <TopBar />
        <Header />

        <section className="page-banner">
          <img className="bgimg" src={meta.bannerImage} alt="" />
          <div className="wrap">
            <h1>{meta.title}</h1>
            <div className="breadcrumb">
              <a href="/fr">Accueil</a>
              <span className="sep">/</span>
              {meta.breadcrumb}
            </div>
          </div>
        </section>

        <section className="block">
          <div className="wrap">
            {chips.length > 0 && (
              <div className="shop-toolbar">
                <span className="count">{allProducts.length} produit{allProducts.length !== 1 ? 's' : ''}</span>
                <CategoryChips chips={chips} activeSlug={null} allHref="/fr/chemicals" />
              </div>
            )}
            <ProductGrid products={allProducts} />
          </div>
        </section>

        <SiteFooter />
      </>
    )
  }
  ```

- [ ] **Step 2: Run build to check for errors**

  ```bash
  cd app && npm run build
  ```
  Expected: build succeeds (warnings OK, errors not OK).

- [ ] **Step 3: Commit**

  ```bash
  git add app/src/app/[locale]/chemicals/page.tsx
  git commit -m "feat: wire chemicals page to Supabase DB"
  ```

---

## Task 6: Create chemicals/[subcategory]/page.tsx

**Files:**
- Create: `app/src/app/[locale]/chemicals/[subcategory]/page.tsx`

- [ ] **Step 1: Create the file**

  ```tsx
  // app/src/app/[locale]/chemicals/[subcategory]/page.tsx
  import { notFound } from 'next/navigation'
  import TopBar from '@/components/TopBar'
  import Header from '@/components/Header'
  import SiteFooter from '@/components/SiteFooter'
  import ScrollReveal from '@/components/ScrollReveal'
  import ProductGrid from '@/components/ProductGrid'
  import CategoryChips from '@/components/CategoryChips'
  import {
    getCategoryBySlug,
    getChildCategories,
    getProductsByCategory,
  } from '@/lib/supabase/queries'
  import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

  interface Props {
    params: Promise<{ subcategory: string }>
  }

  export default async function ChemicalsSubcategoryPage({ params }: Props) {
    const { subcategory } = await params
    const meta = CATEGORY_ROUTE_META.chemicals

    const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS.chemicals)
    if (!parent) notFound()

    const child = await getCategoryBySlug(subcategory)
    if (!child || child.parent_id !== parent.id) notFound()

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
            <ProductGrid products={products} />
          </div>
        </section>

        <SiteFooter />
      </>
    )
  }
  ```

- [ ] **Step 2: Run build**

  ```bash
  cd app && npm run build
  ```
  Expected: build succeeds.

- [ ] **Step 3: Test manually**

  Start dev server:
  ```bash
  cd app && npm run dev
  ```
  1. Navigate to `http://localhost:3000/fr/chemicals` — chips should appear, products should load from DB
  2. Click a chip — should navigate to `/fr/chemicals/{slug}` and show only that subcategory's products
  3. "Tous" chip should be active on parent page; subcategory chip active on subcategory page
  4. Navigate to `/fr/chemicals/nonexistent` — should show Next.js 404

- [ ] **Step 4: Commit**

  ```bash
  git add app/src/app/[locale]/chemicals/[subcategory]/page.tsx
  git commit -m "feat: add chemicals subcategory page"
  ```

---

## Task 7: Update glassware/page.tsx

**Files:**
- Modify: `app/src/app/[locale]/glassware/page.tsx`

- [ ] **Step 1: Replace the file contents**

  ```tsx
  // app/src/app/[locale]/glassware/page.tsx
  import { notFound } from 'next/navigation'
  import TopBar from '@/components/TopBar'
  import Header from '@/components/Header'
  import SiteFooter from '@/components/SiteFooter'
  import ScrollReveal from '@/components/ScrollReveal'
  import ProductGrid from '@/components/ProductGrid'
  import CategoryChips from '@/components/CategoryChips'
  import {
    getCategoryBySlug,
    getChildCategories,
    getProductsByCategory,
  } from '@/lib/supabase/queries'
  import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

  export default async function GlasswarePage() {
    const meta = CATEGORY_ROUTE_META.glassware
    const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS.glassware)
    if (!parent) notFound()

    const children = await getChildCategories(parent.id)

    const allProducts = children.length > 0
      ? (await Promise.all(children.map((c) => getProductsByCategory(c.id)))).flat()
      : await getProductsByCategory(parent.id)

    const chips = children.map((c) => ({
      label: (c.name as { fr: string }).fr,
      href: `/fr/glassware/${c.slug}`,
      slug: c.slug,
    }))

    return (
      <>
        <ScrollReveal />
        <TopBar />
        <Header />

        <section className="page-banner">
          <img className="bgimg" src={meta.bannerImage} alt="" />
          <div className="wrap">
            <h1>{meta.title}</h1>
            <div className="breadcrumb">
              <a href="/fr">Accueil</a>
              <span className="sep">/</span>
              {meta.breadcrumb}
            </div>
          </div>
        </section>

        <section className="block">
          <div className="wrap">
            {chips.length > 0 && (
              <div className="shop-toolbar">
                <span className="count">{allProducts.length} produit{allProducts.length !== 1 ? 's' : ''}</span>
                <CategoryChips chips={chips} activeSlug={null} allHref="/fr/glassware" />
              </div>
            )}
            <ProductGrid products={allProducts} />
          </div>
        </section>

        <SiteFooter />
      </>
    )
  }
  ```

- [ ] **Step 2: Run build**

  ```bash
  cd app && npm run build
  ```
  Expected: build succeeds.

- [ ] **Step 3: Commit**

  ```bash
  git add app/src/app/[locale]/glassware/page.tsx
  git commit -m "feat: wire glassware page to Supabase DB"
  ```

---

## Task 8: Create glassware/[subcategory]/page.tsx

**Files:**
- Create: `app/src/app/[locale]/glassware/[subcategory]/page.tsx`

- [ ] **Step 1: Create the file**

  ```tsx
  // app/src/app/[locale]/glassware/[subcategory]/page.tsx
  import { notFound } from 'next/navigation'
  import TopBar from '@/components/TopBar'
  import Header from '@/components/Header'
  import SiteFooter from '@/components/SiteFooter'
  import ScrollReveal from '@/components/ScrollReveal'
  import ProductGrid from '@/components/ProductGrid'
  import CategoryChips from '@/components/CategoryChips'
  import {
    getCategoryBySlug,
    getChildCategories,
    getProductsByCategory,
  } from '@/lib/supabase/queries'
  import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

  interface Props {
    params: Promise<{ subcategory: string }>
  }

  export default async function GlasswareSubcategoryPage({ params }: Props) {
    const { subcategory } = await params
    const meta = CATEGORY_ROUTE_META.glassware

    const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS.glassware)
    if (!parent) notFound()

    const child = await getCategoryBySlug(subcategory)
    if (!child || child.parent_id !== parent.id) notFound()

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
            <ProductGrid products={products} />
          </div>
        </section>

        <SiteFooter />
      </>
    )
  }
  ```

- [ ] **Step 2: Run build**

  ```bash
  cd app && npm run build
  ```
  Expected: build succeeds.

- [ ] **Step 3: Commit**

  ```bash
  git add app/src/app/[locale]/glassware/[subcategory]/page.tsx
  git commit -m "feat: add glassware subcategory page"
  ```

---

## Task 9: Update lab-equipment/page.tsx

**Files:**
- Modify: `app/src/app/[locale]/lab-equipment/page.tsx`

- [ ] **Step 1: Replace the file contents**

  ```tsx
  // app/src/app/[locale]/lab-equipment/page.tsx
  import { notFound } from 'next/navigation'
  import TopBar from '@/components/TopBar'
  import Header from '@/components/Header'
  import SiteFooter from '@/components/SiteFooter'
  import ScrollReveal from '@/components/ScrollReveal'
  import ProductGrid from '@/components/ProductGrid'
  import CategoryChips from '@/components/CategoryChips'
  import {
    getCategoryBySlug,
    getChildCategories,
    getProductsByCategory,
  } from '@/lib/supabase/queries'
  import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

  export default async function LabEquipmentPage() {
    const meta = CATEGORY_ROUTE_META['lab-equipment']
    const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS['lab-equipment'])
    if (!parent) notFound()

    const children = await getChildCategories(parent.id)

    const allProducts = children.length > 0
      ? (await Promise.all(children.map((c) => getProductsByCategory(c.id)))).flat()
      : await getProductsByCategory(parent.id)

    const chips = children.map((c) => ({
      label: (c.name as { fr: string }).fr,
      href: `/fr/lab-equipment/${c.slug}`,
      slug: c.slug,
    }))

    return (
      <>
        <ScrollReveal />
        <TopBar />
        <Header />

        <section className="page-banner">
          <img className="bgimg" src={meta.bannerImage} alt="" />
          <div className="wrap">
            <h1>{meta.title}</h1>
            <div className="breadcrumb">
              <a href="/fr">Accueil</a>
              <span className="sep">/</span>
              {meta.breadcrumb}
            </div>
          </div>
        </section>

        <section className="block">
          <div className="wrap">
            {chips.length > 0 && (
              <div className="shop-toolbar">
                <span className="count">{allProducts.length} produit{allProducts.length !== 1 ? 's' : ''}</span>
                <CategoryChips chips={chips} activeSlug={null} allHref="/fr/lab-equipment" />
              </div>
            )}
            <ProductGrid products={allProducts} />
          </div>
        </section>

        <SiteFooter />
      </>
    )
  }
  ```

- [ ] **Step 2: Run build**

  ```bash
  cd app && npm run build
  ```
  Expected: build succeeds.

- [ ] **Step 3: Commit**

  ```bash
  git add app/src/app/[locale]/lab-equipment/page.tsx
  git commit -m "feat: wire lab-equipment page to Supabase DB"
  ```

---

## Task 10: Create lab-equipment/[subcategory]/page.tsx

**Files:**
- Create: `app/src/app/[locale]/lab-equipment/[subcategory]/page.tsx`

- [ ] **Step 1: Create the file**

  ```tsx
  // app/src/app/[locale]/lab-equipment/[subcategory]/page.tsx
  import { notFound } from 'next/navigation'
  import TopBar from '@/components/TopBar'
  import Header from '@/components/Header'
  import SiteFooter from '@/components/SiteFooter'
  import ScrollReveal from '@/components/ScrollReveal'
  import ProductGrid from '@/components/ProductGrid'
  import CategoryChips from '@/components/CategoryChips'
  import {
    getCategoryBySlug,
    getChildCategories,
    getProductsByCategory,
  } from '@/lib/supabase/queries'
  import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

  interface Props {
    params: Promise<{ subcategory: string }>
  }

  export default async function LabEquipmentSubcategoryPage({ params }: Props) {
    const { subcategory } = await params
    const meta = CATEGORY_ROUTE_META['lab-equipment']

    const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS['lab-equipment'])
    if (!parent) notFound()

    const child = await getCategoryBySlug(subcategory)
    if (!child || child.parent_id !== parent.id) notFound()

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
            <ProductGrid products={products} />
          </div>
        </section>

        <SiteFooter />
      </>
    )
  }
  ```

- [ ] **Step 2: Run build**

  ```bash
  cd app && npm run build
  ```
  Expected: build succeeds.

- [ ] **Step 3: Final manual test**

  Start dev server:
  ```bash
  cd app && npm run dev
  ```
  Verify all three category families:
  1. `/fr/chemicals` — loads, chips visible, products from DB
  2. `/fr/chemicals/{slug}` — filtered products, correct chip highlighted, breadcrumb shows Chimie / {name}
  3. `/fr/glassware` — same pattern
  4. `/fr/glassware/{slug}` — same pattern
  5. `/fr/lab-equipment` — same pattern
  6. `/fr/lab-equipment/{slug}` — same pattern
  7. Any invalid slug — 404

- [ ] **Step 4: Commit**

  ```bash
  git add app/src/app/[locale]/lab-equipment/[subcategory]/page.tsx
  git commit -m "feat: add lab-equipment subcategory page"
  ```
