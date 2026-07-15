# pSEO Category × City Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate 40 SEO landing pages (4 existing top-level categories × 10 Moroccan cities) at `/[locale]/{categoryRoute}/villes/[city]`, plus the sitemap.ts and generateMetadata plumbing this site currently has nowhere.

**Architecture:** Two new static config files (city facts, category→city copy templates) feed a shared server-component renderer. Four thin page.tsx files (one per existing category folder) call that renderer plus export `generateMetadata`. Existing category pages get a new internal-linking block pointing at their 10 city pages. A new root `sitemap.ts` enumerates everything.

**Tech Stack:** Next.js (app router, `src/app/[locale]/...`), next-intl routing, Supabase queries (`getCategoryBySlug`, `getProductsByFamily` — already exist, unchanged), existing `ProductGrid`/`CategoryChips` components. No test framework is configured in this repo (no jest/vitest/playwright, only `eslint` and `next build`) — verification is via `npm run build`, `npm run lint`, and manual dev-server checks, not unit tests.

**Spec:** `docs/superpowers/specs/2026-07-15-pseo-city-pages-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/siteConfig.ts` | Create. Single `SITE_URL` constant (`https://lelaboratoire.ma`) used by canonical URLs and sitemap. |
| `src/lib/pseo/cities.ts` | Create. Static array of 10 `CityInfo` records. |
| `src/lib/pseo/cityIntro.ts` | Create. Pure functions building the on-page intro paragraph and the meta description string per (category, city) pair. |
| `src/lib/pseo/renderCityPage.tsx` | Create. Shared async server-component function: fetches category+products, renders banner/breadcrumb/intro/delivery block/grid. |
| `src/lib/pseo/cityMetadata.ts` | Create. Pure function building a Next.js `Metadata` object per (category, city, locale). Called from each page's `generateMetadata`. |
| `src/components/CityDeliveryBlock.tsx` | Create. Small presentational component: delivery days + zones served + CTA link to `/contact`. |
| `src/app/[locale]/chemicals/villes/[city]/page.tsx` | Create. Thin page: `generateMetadata` + calls `renderCityPage('chemicals', city)`. |
| `src/app/[locale]/glassware/villes/[city]/page.tsx` | Create. Same pattern for glassware. |
| `src/app/[locale]/lab-equipment/villes/[city]/page.tsx` | Create. Same pattern for lab-equipment. |
| `src/app/[locale]/petit-outillage/villes/[city]/page.tsx` | Create. Same pattern for petit-outillage. |
| `src/app/[locale]/chemicals/page.tsx` | Modify. Add "Livraison dans votre ville" links block. |
| `src/app/[locale]/glassware/page.tsx` | Modify. Same. |
| `src/app/[locale]/lab-equipment/page.tsx` | Modify. Same. |
| `src/app/[locale]/petit-outillage/page.tsx` | Modify. Same. |
| `src/app/sitemap.ts` | Create. `MetadataRoute.Sitemap` enumerating all 40 city pages × 2 locales + existing static routes. |

---

### Task 1: Site URL constant

**Files:**
- Create: `src/lib/siteConfig.ts`

- [ ] **Step 1: Create the file**

```ts
// src/lib/siteConfig.ts
export const SITE_URL = 'https://lelaboratoire.ma'
```

- [ ] **Step 2: Verify it compiles**

Run: `cd app && npx tsc --noEmit`
Expected: no new errors referencing `siteConfig.ts`

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/siteConfig.ts
git commit -m "feat(pseo): add SITE_URL constant"
```

---

### Task 2: City data config

**Files:**
- Create: `src/lib/pseo/cities.ts`

- [ ] **Step 1: Create the file**

```ts
// src/lib/pseo/cities.ts
export interface CityInfo {
  slug: string
  name: string
  region: string
  deliveryDays: string
  zonesServed: string[]
}

export const CITIES: CityInfo[] = [
  { slug: 'casablanca', name: 'Casablanca', region: 'Casablanca-Settat', deliveryDays: '24-48h', zonesServed: ['Ain Sebaâ', 'Sidi Bernoussi', 'Maârif', 'Sidi Maârouf'] },
  { slug: 'rabat', name: 'Rabat', region: 'Rabat-Salé-Kénitra', deliveryDays: '24-48h', zonesServed: ['Agdal', 'Hay Riad', 'Yacoub El Mansour'] },
  { slug: 'marrakech', name: 'Marrakech', region: 'Marrakech-Safi', deliveryDays: '48-72h', zonesServed: ['Guéliz', 'Sidi Youssef Ben Ali', 'Menara'] },
  { slug: 'fes', name: 'Fès', region: 'Fès-Meknès', deliveryDays: '48-72h', zonesServed: ['Fès Médina', 'Fès Nouvelle', 'Saïss'] },
  { slug: 'tanger', name: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma', deliveryDays: '48-72h', zonesServed: ['Tanger Med', 'Beni Makada', 'Charf'] },
  { slug: 'agadir', name: 'Agadir', region: 'Souss-Massa', deliveryDays: '48-72h', zonesServed: ['Founty', 'Dakhla', 'Hay Mohammadi'] },
  { slug: 'meknes', name: 'Meknès', region: 'Fès-Meknès', deliveryDays: '48-72h', zonesServed: ['Hamria', 'Marjane', 'Ville Nouvelle'] },
  { slug: 'oujda', name: 'Oujda', region: "L'Oriental", deliveryDays: '72h', zonesServed: ['Al Qods', 'Sidi Yahya', 'Centre-ville'] },
  { slug: 'kenitra', name: 'Kénitra', region: 'Rabat-Salé-Kénitra', deliveryDays: '24-48h', zonesServed: ['Ouled Oujih', 'Mimosas', 'Centre-ville'] },
  { slug: 'tetouan', name: 'Tétouan', region: 'Tanger-Tétouan-Al Hoceïma', deliveryDays: '48-72h', zonesServed: ['Sania Ramel', 'Médina', 'Al Martil'] },
]

export function getCityBySlug(slug: string): CityInfo | null {
  return CITIES.find((c) => c.slug === slug) ?? null
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd app && npx tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/pseo/cities.ts
git commit -m "feat(pseo): add static city data config"
```

---

### Task 3: City + category content templates

**Files:**
- Create: `src/lib/pseo/cityIntro.ts`

Depends on `CATEGORY_ROUTE_META`/`CATEGORY_ROUTE_SLUGS` (`src/lib/categoryRoutes.ts`, already exists) and `CityInfo` (Task 2).

- [ ] **Step 1: Create the file**

```ts
// src/lib/pseo/cityIntro.ts
import type { CategoryRoute } from '@/lib/categoryRoutes'
import { CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'
import type { CityInfo } from '@/lib/pseo/cities'

const INTRO_VERBS: Record<CategoryRoute, string> = {
  chemicals: 'livrons des produits chimiques de laboratoire',
  glassware: 'fournissons de la verrerie et des consommables de laboratoire',
  'lab-equipment': 'équipons les laboratoires en instruments et appareils',
  'petit-outillage': 'fournissons du petit outillage de laboratoire',
}

export function buildCityIntro(categoryRoute: CategoryRoute, city: CityInfo): string {
  const label = CATEGORY_ROUTE_META[categoryRoute].breadcrumb
  const verb = INTRO_VERBS[categoryRoute]
  const zones = city.zonesServed.join(', ')
  return `À ${city.name} (région ${city.region}), nous ${verb} aux laboratoires, universités, cliniques et centres industriels. Notre catalogue ${label.toLowerCase()} est livré sous ${city.deliveryDays}, avec une couverture incluant ${zones} et les environs.`
}

export function buildCityMetaDescription(categoryRoute: CategoryRoute, city: CityInfo): string {
  const label = CATEGORY_ROUTE_META[categoryRoute].breadcrumb
  return `${label} à ${city.name} : catalogue complet, livraison en ${city.deliveryDays}. Le Laboratoire dessert ${city.zonesServed[0]} et tout ${city.region}.`.slice(0, 155)
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd app && npx tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/pseo/cityIntro.ts
git commit -m "feat(pseo): add city+category content templates"
```

---

### Task 4: Delivery block component

**Files:**
- Create: `src/components/CityDeliveryBlock.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/components/CityDeliveryBlock.tsx
import type { CityInfo } from '@/lib/pseo/cities'

interface Props {
  city: CityInfo
}

export default function CityDeliveryBlock({ city }: Props) {
  return (
    <div className="city-delivery-block">
      <h2>Livraison à {city.name}</h2>
      <p>Délai de livraison estimé : <strong>{city.deliveryDays}</strong></p>
      <p>Zones desservies : {city.zonesServed.join(', ')}</p>
      <a className="btn" href="/contact">Demander un devis</a>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd app && npx tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add app/src/components/CityDeliveryBlock.tsx
git commit -m "feat(pseo): add city delivery block component"
```

---

### Task 5: Metadata builder

**Files:**
- Create: `src/lib/pseo/cityMetadata.ts`

- [ ] **Step 1: Create the file**

```ts
// src/lib/pseo/cityMetadata.ts
import type { Metadata } from 'next'
import type { CategoryRoute } from '@/lib/categoryRoutes'
import { CATEGORY_ROUTE_META, CATEGORY_ROUTE_SLUGS } from '@/lib/categoryRoutes'
import { getCityBySlug } from '@/lib/pseo/cities'
import { buildCityMetaDescription } from '@/lib/pseo/cityIntro'
import { SITE_URL } from '@/lib/siteConfig'

export function buildCityPageMetadata(categoryRoute: CategoryRoute, citySlug: string): Metadata {
  const city = getCityBySlug(citySlug)
  if (!city) return {}

  const label = CATEGORY_ROUTE_META[categoryRoute].breadcrumb
  const routeSlug = CATEGORY_ROUTE_SLUGS[categoryRoute]
  const canonical = `${SITE_URL}/fr/${routeSlug}/villes/${citySlug}`

  return {
    title: `${label} à ${city.name} | Le Laboratoire`,
    description: buildCityMetaDescription(categoryRoute, city),
    alternates: { canonical },
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd app && npx tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/pseo/cityMetadata.ts
git commit -m "feat(pseo): add city page metadata builder"
```

---

### Task 6: Shared city page renderer

**Files:**
- Create: `src/lib/pseo/renderCityPage.tsx`

Mirrors the existing `glassware/page.tsx` structure (banner, breadcrumb, product grid) plus the new intro/delivery blocks.

- [ ] **Step 1: Create the file**

```tsx
// src/lib/pseo/renderCityPage.tsx
import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import ProductGrid from '@/components/ProductGrid'
import CityDeliveryBlock from '@/components/CityDeliveryBlock'
import {
  getCategoryBySlug,
  getProductsByFamily,
} from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META, type CategoryRoute } from '@/lib/categoryRoutes'
import { getCityBySlug } from '@/lib/pseo/cities'
import { buildCityIntro } from '@/lib/pseo/cityIntro'

export async function renderCityPage(categoryRoute: CategoryRoute, citySlug: string) {
  const city = getCityBySlug(citySlug)
  if (!city) notFound()

  const meta = CATEGORY_ROUTE_META[categoryRoute]
  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS[categoryRoute])
  if (!parent) notFound()

  const allProducts = await getProductsByFamily(parent.id)
  const intro = buildCityIntro(categoryRoute, city)
  const basePath = `/fr/${CATEGORY_ROUTE_SLUGS[categoryRoute]}`

  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src={meta.bannerImage} alt="" />
        <div className="wrap">
          <h1>{meta.title} à {city.name}</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            <a href={basePath}>{meta.breadcrumb}</a>
            <span className="sep">/</span>
            {city.name}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <p className="city-intro">{intro}</p>
          <CityDeliveryBlock city={city} />
          <div className="shop-toolbar">
            <span className="count">{allProducts.length} produit{allProducts.length !== 1 ? 's' : ''}</span>
          </div>
          <ProductGrid products={allProducts} basePath={basePath} />
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd app && npx tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add app/src/lib/pseo/renderCityPage.tsx
git commit -m "feat(pseo): add shared city page renderer"
```

---

### Task 7: Four category city page routes

**Files:**
- Create: `src/app/[locale]/chemicals/villes/[city]/page.tsx`
- Create: `src/app/[locale]/glassware/villes/[city]/page.tsx`
- Create: `src/app/[locale]/lab-equipment/villes/[city]/page.tsx`
- Create: `src/app/[locale]/petit-outillage/villes/[city]/page.tsx`

Each file is identical except the category key. Full content shown for `glassware`; repeat verbatim for the other three, swapping only the string literal.

- [ ] **Step 1: Create `glassware/villes/[city]/page.tsx`**

```tsx
// src/app/[locale]/glassware/villes/[city]/page.tsx
import type { Metadata } from 'next'
import { renderCityPage } from '@/lib/pseo/renderCityPage'
import { buildCityPageMetadata } from '@/lib/pseo/cityMetadata'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params
  return buildCityPageMetadata('glassware', city)
}

export default async function GlasswareCityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  return renderCityPage('glassware', city)
}
```

- [ ] **Step 2: Create `chemicals/villes/[city]/page.tsx`** (same as above with `'chemicals'` in both call sites and function renamed `ChemicalsCityPage`)

- [ ] **Step 3: Create `lab-equipment/villes/[city]/page.tsx`** (same with `'lab-equipment'`, function `LabEquipmentCityPage`)

- [ ] **Step 4: Create `petit-outillage/villes/[city]/page.tsx`** (same with `'petit-outillage'`, function `PetitOutillageCityPage`)

- [ ] **Step 5: Build the app**

Run: `cd app && npm run build`
Expected: build succeeds, no type errors. Build output should list the 4 new `villes/[city]` routes.

- [ ] **Step 6: Commit**

```bash
git add "app/src/app/[locale]/chemicals/villes" "app/src/app/[locale]/glassware/villes" "app/src/app/[locale]/lab-equipment/villes" "app/src/app/[locale]/petit-outillage/villes"
git commit -m "feat(pseo): add category x city landing page routes"
```

---

### Task 8: Manual verification via dev server

**Files:** none (verification only)

- [ ] **Step 1: Start dev server**

Run: `cd app && npm run dev`

- [ ] **Step 2: Check three sample pages in browser**

Visit:
- `http://localhost:3000/fr/verrerie/villes/casablanca`
- `http://localhost:3000/fr/chimie/villes/marrakech`
- `http://localhost:3000/fr/petit-outillage/villes/tetouan`

Expected: each renders banner with city name in H1, breadcrumb, unique intro paragraph, delivery block with correct city data, product grid (same products as parent category page), footer. No console errors in browser devtools.

- [ ] **Step 3: Check unknown city returns 404**

Visit: `http://localhost:3000/fr/verrerie/villes/nonexistent-city`
Expected: Next.js 404 page

- [ ] **Step 4: Check page source for metadata**

Run: `curl -s http://localhost:3000/fr/verrerie/villes/casablanca | grep -o '<title>[^<]*</title>'`
Expected: `<title>Verrerie à Casablanca | Le Laboratoire</title>`

- [ ] **Step 5: Stop dev server, no commit needed for this task**

---

### Task 9: Internal linking from parent category pages

**Files:**
- Modify: `src/app/[locale]/glassware/page.tsx`
- Modify: `src/app/[locale]/chemicals/page.tsx`
- Modify: `src/app/[locale]/lab-equipment/page.tsx`
- Modify: `src/app/[locale]/petit-outillage/page.tsx`

- [ ] **Step 1: Add city links import to `glassware/page.tsx`**

Add near the top imports:

```tsx
import { CITIES } from '@/lib/pseo/cities'
import { CATEGORY_ROUTE_SLUGS } from '@/lib/categoryRoutes'
```

- [ ] **Step 2: Add the links block before `<SiteFooter />` in `glassware/page.tsx`**

Insert this section between the closing `</section>` of the product grid block and `<SiteFooter />`:

```tsx
      <section className="block city-links">
        <div className="wrap">
          <h2>Livraison dans votre ville</h2>
          <ul className="city-link-list">
            {CITIES.map((city) => (
              <li key={city.slug}>
                <a href={`/fr/${CATEGORY_ROUTE_SLUGS.glassware}/villes/${city.slug}`}>
                  Verrerie à {city.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
```

- [ ] **Step 3: Repeat steps 1-2 for `chemicals/page.tsx`**

Same import block. Links block uses `CATEGORY_ROUTE_SLUGS.chemicals` and label `Produits chimiques à {city.name}`.

- [ ] **Step 4: Repeat for `lab-equipment/page.tsx`**

Uses `CATEGORY_ROUTE_SLUGS['lab-equipment']` and label `Équipements à {city.name}`.

- [ ] **Step 5: Repeat for `petit-outillage/page.tsx`**

Uses `CATEGORY_ROUTE_SLUGS['petit-outillage']` and label `Petit outillage à {city.name}`.

- [ ] **Step 6: Build**

Run: `cd app && npm run build`
Expected: build succeeds

- [ ] **Step 7: Commit**

```bash
git add "app/src/app/[locale]/glassware/page.tsx" "app/src/app/[locale]/chemicals/page.tsx" "app/src/app/[locale]/lab-equipment/page.tsx" "app/src/app/[locale]/petit-outillage/page.tsx"
git commit -m "feat(pseo): link category pages to their city landing pages"
```

---

### Task 10: Sitemap

**Files:**
- Create: `src/app/sitemap.ts`

- [ ] **Step 1: Create the file**

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/siteConfig'
import { CATEGORY_ROUTE_SLUGS } from '@/lib/categoryRoutes'
import { CITIES } from '@/lib/pseo/cities'
import { routing } from '@/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ['', '/shop', '/about', '/contact', '/catalogues', '/blog']
  const categoryPaths = Object.values(CATEGORY_ROUTE_SLUGS).map((slug) => `/${slug}`)

  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    [...staticPaths, ...categoryPaths].map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
    })),
  )

  const cityEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    Object.values(CATEGORY_ROUTE_SLUGS).flatMap((routeSlug) =>
      CITIES.map((city) => ({
        url: `${SITE_URL}/${locale}/${routeSlug}/villes/${city.slug}`,
        lastModified: new Date(),
      })),
    ),
  )

  return [...staticEntries, ...cityEntries]
}
```

- [ ] **Step 2: Build**

Run: `cd app && npm run build`
Expected: build succeeds, sitemap route listed in output

- [ ] **Step 3: Verify sitemap output manually**

Run: `cd app && npm run dev` (in background), then in another terminal: `curl -s http://localhost:3000/sitemap.xml | grep -c '<url>'`
Expected: `80` (40 city pages × 2 locales) plus static entries — count should be `80 + (6 static + 4 category) * 2 = 100`

- [ ] **Step 4: Commit**

```bash
git add app/src/app/sitemap.ts
git commit -m "feat(pseo): add sitemap.ts covering city pages and static routes"
```

---

### Task 11: Lint pass

**Files:** none (verification only)

- [ ] **Step 1: Run lint**

Run: `cd app && npm run lint`
Expected: no errors in newly created/modified files

- [ ] **Step 2: Fix any lint errors found, re-run, then commit if changes were made**

```bash
git add -u
git commit -m "fix(pseo): address lint findings"
```

---

## Self-Review Notes

- **Spec coverage:** URL structure (Task 7), data model (Task 2), content generation (Task 3), internal linking (Task 9), metadata + sitemap (Tasks 5, 10), error handling for unknown city/category (`notFound()` in Task 6, verified in Task 8), testing/verification (Tasks 8, 11) — all spec sections have a corresponding task. Comparison/use-case/glossary pages are explicitly out of scope per spec, no tasks created for them.
- **No test framework:** confirmed via `package.json` scripts (only `dev`/`build`/`start`/`lint`) — plan uses build/lint/manual dev-server checks instead of unit tests, consistent with rest of repo.
- **Type consistency:** `CategoryRoute` type (from `categoryRoutes.ts`) is threaded through `cityIntro.ts`, `cityMetadata.ts`, and `renderCityPage.tsx` consistently. `CityInfo` (Task 2) used consistently in `cityIntro.ts`, `CityDeliveryBlock.tsx`, `renderCityPage.tsx`.
