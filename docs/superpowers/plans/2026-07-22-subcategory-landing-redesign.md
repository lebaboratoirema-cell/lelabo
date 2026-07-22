# Subcategory-First Landing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat product-grid+chips landing on `/fr/lab-equipment`, `/fr/petit-outillage`, `/fr/chemicals` with subcategory (or subcategory-group) card grids, retire `/fr/glassware` with a redirect into `/fr/petit-outillage`, and add the DB support (`group_key`/`group_label` columns + grouped query) that makes it possible.

**Architecture:** One new migration adds two nullable columns to `categories`. A one-off script backfills `group_key`/`group_label` for the 57 `equipements` and 81 `petit-outillage` subcategories per the spec's fixed mapping (`chimie` stays ungrouped). A new `getChildCategoriesGrouped()` query groups already-`position`-ordered children by first-seen `group_key`, so group order falls out of the existing `position` column with no new table. A new `CategoryCardGrid` component reuses the `/shop` page's `cat-grid`/`cat-card` markup and CSS classes, now driven by DB data instead of a hardcoded array. Two new `groupe/[group]/page.tsx` routes list a group's subcategories as plain text links (a new lightweight `.subcat-list` CSS block — no images, per spec's explicit scope cut). `/fr/glassware/**` gets a permanent redirect via `next.config.ts`; the two remaining hardcoded `/glassware` links (`ServicesSection.tsx`, `/shop`) get repointed to `/petit-outillage` since `Header.tsx` turned out to have no `/glassware` link to begin with (spec's file reference was a research-time approximation, corrected here — see Task 10 for detail).

**Tech Stack:** Next.js 16 (App Router, `[locale]` segment via next-intl, French hardcoded in existing hrefs throughout — new code follows that convention), Supabase (Postgres) via `@supabase/supabase-js`, raw SQL migrations run through `app/scripts/run-migration.mjs`, no test runner configured in this repo (`app/package.json` has no `test` script) — verification here is `next build` (typecheck) + manual dev-server/curl checks per task, not automated tests.

---

## File structure

- **Create** `supabase/migrations/008_category_groups.sql` — adds `group_key`, `group_label` to `categories`.
- **Create** `app/scripts/assign-category-groups.mjs` — one-off backfill script (idempotent, `--dry-run` supported).
- **Modify** `app/src/types/database.ts` — add `group_key`/`group_label` to the `Category` interface.
- **Modify** `app/src/lib/supabase/queries.ts` — add `getChildCategoriesGrouped()` + `CategoryGroup` type.
- **Create** `app/src/components/CategoryCardGrid.tsx` — DB-driven version of `/shop`'s image-card grid, reused by 3 family root pages.
- **Modify** `app/src/app/[locale]/lab-equipment/page.tsx` — swap product-grid+chips for the group card grid.
- **Modify** `app/src/app/[locale]/petit-outillage/page.tsx` — same swap.
- **Modify** `app/src/app/[locale]/chemicals/page.tsx` — swap for a flat subcategory card grid (no group layer).
- **Create** `app/src/app/[locale]/lab-equipment/groupe/[group]/page.tsx` — lists a group's subcategories as text links.
- **Create** `app/src/app/[locale]/petit-outillage/groupe/[group]/page.tsx` — same, for petit-outillage.
- **Modify** `app/src/app/globals.css` — add `.subcat-list` block for the group→subcategory listing pages.
- **Modify** `app/next.config.ts` — add `redirects()` for `/glassware/**` → `/petit-outillage/**`.
- **Modify** `app/src/components/ServicesSection.tsx` — repoint the two `/glassware` hrefs.
- **Modify** `app/src/app/[locale]/shop/page.tsx` — repoint the three `/fr/glassware` hrefs.

Images already exist at `app/public/images/groups/{equipements,petit-outillage,chimie}/<slug-or-group_key>.webp` (confirmed present, 32 files) — no image-sourcing task needed.

---

## Task 1: Migration — add `group_key`/`group_label` to `categories`

**Files:**
- Create: `supabase/migrations/008_category_groups.sql`

- [ ] **Step 1: Write the migration**

```sql
alter table categories
  add column group_key text,
  add column group_label jsonb;

create index categories_group_key_idx on categories (parent_id, group_key);
```

- [ ] **Step 2: Apply it**

Run (from `app/`): `node --env-file=.env.local scripts/run-migration.mjs 008_category_groups.sql`
Expected output: `Applied 008_category_groups.sql`

- [ ] **Step 3: Verify the columns exist**

Run: `node --env-file=.env.local -e "import('pg').then(async ({default:pg})=>{const c=new pg.Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();const r=await c.query(\"select column_name from information_schema.columns where table_name='categories' and column_name in ('group_key','group_label')\");console.log(r.rows);await c.end();})"`
Expected: two rows, `group_key` and `group_label`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/008_category_groups.sql
git commit -m "feat(db): add group_key/group_label columns to categories"
```

---

## Task 2: Update `Category` type

**Files:**
- Modify: `app/src/types/database.ts:7-17`

- [ ] **Step 1: Add the two new fields**

```ts
export interface Category {
  id: string
  parent_id: string | null
  slug: string
  name: LocalizedText
  description: LocalizedText | null
  image_url: string | null
  group_key: string | null
  group_label: LocalizedText | null
  position: number
  is_active: boolean
  created_at: string
}
```

- [ ] **Step 2: Typecheck**

Run (from `app/`): `npx tsc --noEmit`
Expected: no new errors (pre-existing errors, if any, are out of scope — compare against a baseline run before this change if unsure).

- [ ] **Step 3: Commit**

```bash
git add app/src/types/database.ts
git commit -m "feat(types): add group_key/group_label to Category"
```

---

## Task 3: Backfill script — assign groups to `equipements` and `petit-outillage` subcategories

**Files:**
- Create: `app/scripts/assign-category-groups.mjs`

- [ ] **Step 1: Write the script**

```js
// One-off: assign group_key/group_label to équipements and petit-outillage subcategories
// per the 10-group taxonomy in
// docs/superpowers/specs/2026-07-22-subcategory-landing-redesign-design.md.
// chimie is intentionally left ungrouped (group_key stays null).
// Run: node --env-file=.env.local scripts/assign-category-groups.mjs [--dry-run]

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const DRY_RUN = process.argv.includes('--dry-run')

const EQUIPEMENTS_GROUPS = [
  { group_key: 'chauffage-sechage-etuves', label_fr: 'Chauffage, séchage & étuves', slugs: ['bains', 'block-heaters', 'drying-cabinets', 'furnaces', 'hotplates', 'ovens', 'incubators', 'stirrers'] },
  { group_key: 'refrigeration-cryogenie', label_fr: 'Réfrigération & cryogénie', slugs: ['chillers', 'cryostats', 'freeze-dryers', 'ice-machines', 'refrigeration'] },
  { group_key: 'pesee-mesure-physique', label_fr: 'Pesée & mesure physique', slugs: ['balances', 'hydrometers', 'density-meters', 'viscometers', 'refractometres', 'rheometers'] },
  { group_key: 'ph-conductivite-eau', label_fr: "pH, conductivité & qualité de l'eau", slugs: ['conductivity-meters', 'ph-meters', 'dissolved-oxygen-meters', 'multichannel-meters', 'turbidity-meters', 'osmometers', 'water-purification', 'hygrometers'] },
  { group_key: 'spectro-chromato-analyse', label_fr: 'Spectro, chromato & analyse', slugs: ['spectrophotometers', 'colorimeters', 'flame-photometers', 'hplc', 'lc-ms', 'nmr', 'mass-spectrometry-supplies', 'melting-point-apparatus', 'titrators'] },
  { group_key: 'agitation-melange-centrifugation', label_fr: 'Agitation, mélange & centrifugation', slugs: ['mixers', 'homogenisers', 'sieve-shakers', 'centrifuges', 'rotary-evaporators'] },
  { group_key: 'microscopie-comptage', label_fr: 'Microscopie & comptage', slugs: ['microscopes', 'microtomes', 'colony-counters', 'microplate-readers', 'laveurs-microplaques'] },
  { group_key: 'securite-confinement', label_fr: 'Sécurité & confinement', slugs: ['biological-safety-cabinets', 'fume-cupboards', 'laminar-flow-cabinets', 'glove-boxes', 'autoclaves', 'glass-washers'] },
  { group_key: 'biologie-moleculaire', label_fr: 'Biologie moléculaire', slugs: ['thermal-cyclers', 'electroporators'] },
  { group_key: 'instruments-consommables-divers', label_fr: 'Instruments & consommables divers', slugs: ['pipettes', 'thermometers', 'pumps'] },
]

const PETIT_OUTILLAGE_GROUPS = [
  { group_key: 'verrerie-generale-contenants', label_fr: 'Verrerie générale & contenants', slugs: ['outillage-verrerie', 'bonbonne', 'creusets', 'cristallisoir-capsule', 'cuvette-bac-plateau', 'verre-de-montre', 'bille', 'dessiccateur', 'mortier'] },
  { group_key: 'flacons-flaconnage', label_fr: 'Flacons & flaconnage', slugs: ['pissette', 'flacon-de-culture', 'flacon-plastique', 'flacon-verre', 'flacon-pycnometre', 'flacon-laveur', 'flacon-aluminium', 'flacon-mesureur-a-renversement', 'flacon-pulverisateur'] },
  { group_key: 'montage-verrerie-raccords', label_fr: 'Montage de verrerie & raccords', slugs: ['montage-verrerie-refrigerant', 'raccord-plastique-montage-verrerie', 'raccord-montage-verrerie', 'robinet-montage-verrerie', 'support-statif-montage-verrerie', 'tuyau-montage-verrerie', 'tube-montage-verrerie', 'noix-de-serrage', 'anneau-de-lestage', 'extracteur-soxhlet', 'allonge-montage-verrerie', 'collier-de-serrage', 'raccord-verre-montage-verrerie', 'trompe-a-eau-montage-verrerie'] },
  { group_key: 'lames-lamelles-microscopie', label_fr: 'Lames, lamelles & microscopie', slugs: ['cellule-numeration-lame-lamelle', 'couvre-objet-lame-lamelle', 'accessoires-lame-lamelle', 'porte-objet-lame-lamelle'] },
  { group_key: 'pesee-metrologie', label_fr: 'Pesée & métrologie', slugs: ['butyrometre', 'densimetre-areometre', 'pied-a-coulisse', 'poids-de-calibration', 'vase-sabot-nacelle-pesee', 'barometre-pluviometre-psychrometre', 'manometre', 'consistometre'] },
  { group_key: 'instruments-chronometrage', label_fr: 'Instruments de mesure & chronométrage', slugs: ['thermometre', 'minuterie', 'chronometre', 'loupe'] },
  { group_key: 'prelevement-transfert-agitation', label_fr: 'Prélèvement, transfert & agitation', slugs: ['cones', 'petit-materiel-d-agitation', 'seringue', 'sonde-de-prelevement', 'spatule-cuillere', 'louche', 'pince'] },
  { group_key: 'rangement-transport-protection', label_fr: 'Rangement, transport & protection', slugs: ['boite', 'chariot', 'glaciere-accumulateur-de-froid', 'portoir', 'seau', 'panier', 'elevateur-de-laboratoire', 'jarre-anaerobie', 'plateau'] },
  { group_key: 'nettoyage-entretien', label_fr: 'Nettoyage & entretien', slugs: ['bistouri', 'egouttoirs', 'essuyage-lingettes', 'goupillon', 'ciseaux', 'couteau', 'parafilm', 'coton', 'coupe-tube'] },
  { group_key: 'consommables-fournitures', label_fr: 'Consommables & fournitures', slugs: ['etiquettes', 'papier-d-emballage', 'becs', 'crayon-de-laboratoire', 'piles', 'papier-pour-imprimante', 'cahier-de-laboratoire', 'gabarits'] },
]

async function assignFamily(familySlug, groups) {
  const { data: parent, error: parentErr } = await supabase
    .from('categories').select('id').eq('slug', familySlug).single()
  if (parentErr) throw parentErr

  const { data: children, error: childErr } = await supabase
    .from('categories').select('id, slug').eq('parent_id', parent.id)
  if (childErr) throw childErr

  const bySlug = new Map(children.map((c) => [c.slug, c]))
  const assigned = new Set()
  let updateCount = 0

  for (const group of groups) {
    for (const slug of group.slugs) {
      const cat = bySlug.get(slug)
      if (!cat) {
        console.warn(`[${familySlug}] no category found for slug "${slug}" (group ${group.group_key})`)
        continue
      }
      assigned.add(slug)
      updateCount++
      if (DRY_RUN) {
        console.log(`[dry-run] ${familySlug}/${slug} -> ${group.group_key}`)
        continue
      }
      const { error } = await supabase
        .from('categories')
        .update({ group_key: group.group_key, group_label: { fr: group.label_fr } })
        .eq('id', cat.id)
      if (error) throw error
    }
  }

  const unassigned = children.filter((c) => !assigned.has(c.slug))
  if (unassigned.length > 0) {
    console.warn(`[${familySlug}] ${unassigned.length} categories left ungrouped:`, unassigned.map((c) => c.slug))
  }
  console.log(`[${familySlug}] ${updateCount}/${children.length} categories assigned a group.`)
}

await assignFamily('equipements', EQUIPEMENTS_GROUPS)
await assignFamily('petit-outillage', PETIT_OUTILLAGE_GROUPS)
```

- [ ] **Step 2: Dry-run and check coverage**

Run: `node --env-file=.env.local scripts/assign-category-groups.mjs --dry-run`
Expected: `[equipements] 57/57 categories assigned a group.` and `[petit-outillage] 81/81 categories assigned a group.`, with **no** `no category found for slug` or `left ungrouped` warnings. If either count is short, the mapping's slug list doesn't match the live `categories.slug` values — stop and reconcile against `select slug from categories where parent_id = (select id from categories where slug = '<equipements|petit-outillage>')` before proceeding (don't guess at fixes).

- [ ] **Step 3: Run for real**

Run: `node --env-file=.env.local scripts/assign-category-groups.mjs`
Expected: same two summary lines, no dry-run prefix.

- [ ] **Step 4: Verify in DB**

Run: `node --env-file=.env.local -e "import('pg').then(async ({default:pg})=>{const c=new pg.Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();const r=await c.query(\"select p.slug as family, count(*) filter (where c.group_key is not null) as grouped, count(*) as total from categories c join categories p on p.id=c.parent_id where p.slug in ('equipements','petit-outillage') group by p.slug\");console.log(r.rows);await c.end();})"`
Expected: `equipements` 57/57, `petit-outillage` 81/81.

- [ ] **Step 5: Commit**

```bash
git add app/scripts/assign-category-groups.mjs
git commit -m "feat(data): backfill category group_key/group_label for equipements and petit-outillage"
```

---

## Task 4: `getChildCategoriesGrouped()` query

**Files:**
- Modify: `app/src/lib/supabase/queries.ts:21-30` (add new function right after `getChildCategories`)

- [ ] **Step 1: Add the type and function**

```ts
export interface CategoryGroup {
  groupKey: string
  groupLabel: LocalizedText
  categories: Category[]
}

export async function getChildCategoriesGrouped(parentId: string): Promise<CategoryGroup[]> {
  const children = await getChildCategories(parentId)

  const groups = new Map<string, CategoryGroup>()
  const others: Category[] = []

  for (const category of children) {
    if (!category.group_key) {
      others.push(category)
      continue
    }
    const existing = groups.get(category.group_key)
    if (existing) {
      existing.categories.push(category)
    } else {
      groups.set(category.group_key, {
        groupKey: category.group_key,
        groupLabel: category.group_label ?? { fr: category.group_key },
        categories: [category],
      })
    }
  }

  const result = [...groups.values()]
  if (others.length > 0) {
    result.push({ groupKey: '__others__', groupLabel: { fr: 'Autres' }, categories: others })
  }
  return result
}
```

`children` from `getChildCategories` is already `.order('position')`, so the `Map` preserves group order by each group's first-seen (lowest-position) member, and each group's `categories` array stays position-ordered — matching the spec's "ordered by group position then category position" without a separate groups table. Any subcategory with no `group_key` in a grouped family lands in the `__others__` bucket instead of being silently dropped (this should never happen post-Task-3, per Step 4's verification there — if it shows up in the UI, that's the visible signal something in Task 3 was missed).

- [ ] **Step 2: Update the import line for `LocalizedText`**

`app/src/lib/supabase/queries.ts:2` currently imports `Category` etc from `@/types/database` but not `LocalizedText`:

```ts
import type { BlogPost, Category, LocalizedText, Product, ProductImage, ProductWithVariants } from '@/types/database'
```

- [ ] **Step 3: Typecheck**

Run (from `app/`): `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add app/src/lib/supabase/queries.ts
git commit -m "feat(data): add getChildCategoriesGrouped query"
```

---

## Task 5: `CategoryCardGrid` component

**Files:**
- Create: `app/src/components/CategoryCardGrid.tsx`

- [ ] **Step 1: Write the component**

Reuses the exact `cat-grid`/`cat-card` markup and classes from `app/src/app/[locale]/shop/page.tsx:44-55` (backed by `.cat-grid`/`.cat-card` CSS at `app/src/app/globals.css:465-478`), parameterized so it can render either group cards or flat subcategory cards.

```tsx
interface CardItem {
  href: string
  img: string
  title: string
  desc?: string
}

interface Props {
  items: CardItem[]
}

export default function CategoryCardGrid({ items }: Props) {
  return (
    <div className="cat-grid">
      {items.map((item) => (
        <a className="cat-card reveal" href={item.href} key={item.href}>
          <img src={item.img} alt={item.title} />
          <div className="cc">
            <h3>{item.title}</h3>
            {item.desc && <p>{item.desc}</p>}
            <span className="go">Voir →</span>
          </div>
        </a>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run (from `app/`): `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/components/CategoryCardGrid.tsx
git commit -m "feat(ui): add CategoryCardGrid component"
```

---

## Task 6: `.subcat-list` CSS for group→subcategory pages

**Files:**
- Modify: `app/src/app/globals.css` (insert after the `.cat-card` block, i.e. after line 478)

Per spec's out-of-scope note: inner group→subcategory listing pages are text/chip-style, no images. No existing CSS class fits (`.cat-list` at `globals.css:520` is image-card based), so this adds a small new block.

- [ ] **Step 1: Add the CSS**

```css
/* Subcategory text list (group -> subcategory pages) */
.subcat-list { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.subcat-list a { display: block; padding: 18px 20px; border: 1px solid var(--line); border-radius: 10px; color: var(--navy); font-weight: 600; transition: .25s; }
.subcat-list a:hover { border-color: transparent; box-shadow: var(--shadow); transform: translateY(-3px); }
@media (max-width: 980px) { .subcat-list { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 560px) { .subcat-list { grid-template-columns: 1fr; } }
```

- [ ] **Step 2: Commit**

```bash
git add app/src/app/globals.css
git commit -m "feat(ui): add .subcat-list styles for group listing pages"
```

---

## Task 7: `lab-equipment/groupe/[group]/page.tsx` and `petit-outillage/groupe/[group]/page.tsx`

**Files:**
- Create: `app/src/app/[locale]/lab-equipment/groupe/[group]/page.tsx`
- Create: `app/src/app/[locale]/petit-outillage/groupe/[group]/page.tsx`

The `groupe/` segment avoids colliding with existing subcategory/product slugs living directly under the family root (per spec).

- [ ] **Step 1: Write the lab-equipment group page**

```tsx
import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import { getCategoryBySlug, getChildCategoriesGrouped } from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ group: string }>
}

export default async function LabEquipmentGroupPage({ params }: Props) {
  const { group: groupKey } = await params
  const meta = CATEGORY_ROUTE_META['lab-equipment']

  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS['lab-equipment'])
  if (!parent) notFound()

  const groups = await getChildCategoriesGrouped(parent.id)
  const group = groups.find((g) => g.groupKey === groupKey)
  if (!group) notFound()

  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src={meta.bannerImage} alt="" />
        <div className="wrap">
          <h1>{group.groupLabel.fr}</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            <a href="/fr/lab-equipment">{meta.breadcrumb}</a>
            <span className="sep">/</span>
            {group.groupLabel.fr}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="subcat-list">
            {group.categories.map((c) => (
              <a href={`/fr/lab-equipment/${c.slug}`} key={c.id}>
                {(c.name as { fr: string }).fr}
              </a>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
```

- [ ] **Step 2: Write the petit-outillage group page (same shape, different family)**

```tsx
import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import { getCategoryBySlug, getChildCategoriesGrouped } from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ group: string }>
}

export default async function PetitOutillageGroupPage({ params }: Props) {
  const { group: groupKey } = await params
  const meta = CATEGORY_ROUTE_META['petit-outillage']

  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS['petit-outillage'])
  if (!parent) notFound()

  const groups = await getChildCategoriesGrouped(parent.id)
  const group = groups.find((g) => g.groupKey === groupKey)
  if (!group) notFound()

  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src={meta.bannerImage} alt="" />
        <div className="wrap">
          <h1>{group.groupLabel.fr}</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            <a href="/fr/petit-outillage">{meta.breadcrumb}</a>
            <span className="sep">/</span>
            {group.groupLabel.fr}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="subcat-list">
            {group.categories.map((c) => (
              <a href={`/fr/petit-outillage/${c.slug}`} key={c.id}>
                {(c.name as { fr: string }).fr}
              </a>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
```

- [ ] **Step 3: Typecheck**

Run (from `app/`): `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add "app/src/app/[locale]/lab-equipment/groupe" "app/src/app/[locale]/petit-outillage/groupe"
git commit -m "feat(routes): add group listing pages for lab-equipment and petit-outillage"
```

---

## Task 8: Rewrite `lab-equipment/page.tsx` and `petit-outillage/page.tsx` root pages

**Files:**
- Modify: `app/src/app/[locale]/lab-equipment/page.tsx:1-81`
- Modify: `app/src/app/[locale]/petit-outillage/page.tsx:1-82`

Replaces the product-grid+chips block with the group card grid; the `villes/` city-links section is untouched (out of scope per spec).

- [ ] **Step 1: Rewrite `lab-equipment/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import CategoryCardGrid from '@/components/CategoryCardGrid'
import { getCategoryBySlug, getChildCategoriesGrouped } from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'
import { CITIES } from '@/lib/pseo/cities'

export const dynamic = 'force-dynamic'

export default async function LabEquipmentPage() {
  const meta = CATEGORY_ROUTE_META['lab-equipment']
  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS['lab-equipment'])
  if (!parent) notFound()

  const groups = await getChildCategoriesGrouped(parent.id)
  const cards = groups.map((g) => ({
    href: `/fr/lab-equipment/groupe/${g.groupKey}`,
    img: g.groupKey === '__others__' ? '/images/glassware.webp' : `/images/groups/equipements/${g.groupKey}.webp`,
    title: g.groupLabel.fr,
    desc: `${g.categories.length} sous-catégorie${g.categories.length !== 1 ? 's' : ''}`,
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
          <CategoryCardGrid items={cards} />
        </div>
      </section>

      <section className="block city-links">
        <div className="wrap">
          <h2>Livraison dans votre ville</h2>
          <ul className="city-link-list">
            {CITIES.map((city) => (
              <li key={city.slug}>
                <a href={`/fr/lab-equipment/villes/${city.slug}`}>
                  Équipements à {city.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
```

- [ ] **Step 2: Rewrite `petit-outillage/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import CategoryCardGrid from '@/components/CategoryCardGrid'
import { getCategoryBySlug, getChildCategoriesGrouped } from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'
import { CITIES } from '@/lib/pseo/cities'

export const dynamic = 'force-dynamic'

export default async function PetitOutillagePage() {
  const meta = CATEGORY_ROUTE_META['petit-outillage']
  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS['petit-outillage'])
  if (!parent) notFound()

  const groups = await getChildCategoriesGrouped(parent.id)
  const cards = groups.map((g) => ({
    href: `/fr/petit-outillage/groupe/${g.groupKey}`,
    img: g.groupKey === '__others__' ? '/images/glassware.webp' : `/images/groups/petit-outillage/${g.groupKey}.webp`,
    title: g.groupLabel.fr,
    desc: `${g.categories.length} sous-catégorie${g.categories.length !== 1 ? 's' : ''}`,
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
          <CategoryCardGrid items={cards} />
        </div>
      </section>

      <section className="block city-links">
        <div className="wrap">
          <h2>Livraison dans votre ville</h2>
          <ul className="city-link-list">
            {CITIES.map((city) => (
              <li key={city.slug}>
                <a href={`/fr/petit-outillage/villes/${city.slug}`}>
                  Petit outillage à {city.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
```

- [ ] **Step 3: Typecheck**

Run (from `app/`): `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add "app/src/app/[locale]/lab-equipment/page.tsx" "app/src/app/[locale]/petit-outillage/page.tsx"
git commit -m "feat(routes): switch lab-equipment and petit-outillage roots to group card grids"
```

---

## Task 9: Rewrite `chemicals/page.tsx` root page (flat subcategory grid)

**Files:**
- Modify: `app/src/app/[locale]/chemicals/page.tsx:1-82`

`chimie` has no group layer — this is a flat 12-card grid straight off `getChildCategories`, images keyed by subcategory slug (`app/public/images/groups/chimie/<slug>.webp`, already present for all 12).

- [ ] **Step 1: Rewrite the file**

```tsx
import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import CategoryCardGrid from '@/components/CategoryCardGrid'
import { getCategoryBySlug, getChildCategories } from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'
import { CITIES } from '@/lib/pseo/cities'

export const dynamic = 'force-dynamic'

export default async function ChemicalsPage() {
  const meta = CATEGORY_ROUTE_META.chemicals
  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS.chemicals)
  if (!parent) notFound()

  const children = await getChildCategories(parent.id)
  const cards = children.map((c) => ({
    href: `/fr/chemicals/${c.slug}`,
    img: `/images/groups/chimie/${c.slug}.webp`,
    title: (c.name as { fr: string }).fr,
    desc: c.description ? (c.description as { fr: string }).fr : undefined,
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
          <CategoryCardGrid items={cards} />
        </div>
      </section>

      <section className="block city-links">
        <div className="wrap">
          <h2>Livraison dans votre ville</h2>
          <ul className="city-link-list">
            {CITIES.map((city) => (
              <li key={city.slug}>
                <a href={`/fr/chemicals/villes/${city.slug}`}>
                  Produits chimiques à {city.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
```

- [ ] **Step 2: Typecheck**

Run (from `app/`): `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add "app/src/app/[locale]/chemicals/page.tsx"
git commit -m "feat(routes): switch chemicals root to flat subcategory card grid"
```

---

## Task 10: Retire `/glassware` — redirect + repoint the two stale links

**Files:**
- Modify: `app/next.config.ts:6-26`
- Modify: `app/src/components/ServicesSection.tsx:35,45`
- Modify: `app/src/app/[locale]/shop/page.tsx:9,10,12`

Spec text said "Nav link in `Header.tsx` updated to point at `/fr/petit-outillage`" — investigation found `Header.tsx` (`app/src/components/Header.tsx:36-50,80-86`) has **no** `/glassware` link at all (its nav only has `/lab-equipment`, `/chemicals`, `/petit-outillage`, `/blog`, `/about`, `/contact`). The two actual `/glassware` references live in `ServicesSection.tsx` (lines 35, 45 — hrefs on the "Consommables hygiène & sécurité" and "Verrerie de laboratoire Pyrex" cards) and `shop/page.tsx` (lines 9, 10, 12 — three `cat-grid` entries). Those are the ones to repoint; `Header.tsx` needs no change. The `/fr/glassware/**` → `/fr/petit-outillage/**` redirect (new to this codebase — no `redirects()` or `middleware.ts` exists yet) covers any other inbound links (bookmarks, external backlinks, search engine index) regardless.

Existing `/glassware` route files (`app/src/app/[locale]/glassware/page.tsx`, `[subcategory]/page.tsx`, `[subcategory]/[product]/page.tsx`, `villes/[city]/page.tsx`) are left in place, unreachable once the redirect is live — matches the spec's "orphaned, not deleted" treatment of the underlying `verrerie` DB row; deleting route files is not requested by the spec and isn't required for the redirect to work.

- [ ] **Step 1: Add the redirect to `next.config.ts`**

```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/:locale/glassware',
        destination: '/:locale/petit-outillage',
        permanent: true,
      },
      {
        source: '/:locale/glassware/:path*',
        destination: '/:locale/petit-outillage/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 2: Repoint `ServicesSection.tsx` hrefs**

`app/src/components/ServicesSection.tsx:35` (`href: '/glassware',` on the "Consommables hygiène & sécurité" entry) and `:45` (`href: '/glassware',` on "Verrerie de laboratoire Pyrex") both become `href: '/petit-outillage',`.

- [ ] **Step 3: Repoint `shop/page.tsx` hrefs**

`app/src/app/[locale]/shop/page.tsx:9` (Verrerie card), `:10` (Hygiène & sécurité card), `:12` (Consommables card) — all three `href: '/fr/glassware'` become `href: '/fr/petit-outillage'`.

- [ ] **Step 4: Build to confirm the redirect config is valid**

Run (from `app/`): `npx next build`
Expected: build succeeds (redirects are validated at build time; a malformed `source`/`destination` pattern fails the build).

- [ ] **Step 5: Manual verification with the dev server**

Run: `npm run dev` (from `app/`), then in another shell: `curl -I http://localhost:3000/fr/glassware` and `curl -I http://localhost:3000/fr/glassware/some-subcategory`
Expected: both return `HTTP/1.1 308` (or `307`) with a `location` header of `/fr/petit-outillage` and `/fr/petit-outillage/some-subcategory` respectively. Stop the dev server after.

- [ ] **Step 6: Commit**

```bash
git add app/next.config.ts app/src/components/ServicesSection.tsx "app/src/app/[locale]/shop/page.tsx"
git commit -m "fix(routes): redirect /glassware to /petit-outillage and repoint stale links"
```

---

## Task 11: End-to-end manual verification

**Files:** none (verification only)

No test runner is configured in this repo, so this is the closest thing to an integration check for the whole feature.

- [ ] **Step 1: Full build**

Run (from `app/`): `npx next build`
Expected: succeeds with no type or lint errors across all changed files.

- [ ] **Step 2: Start the dev server and check each route**

Run: `npm run dev`, then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/fr/lab-equipment
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/fr/petit-outillage
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/fr/chemicals
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/fr/lab-equipment/groupe/chauffage-sechage-etuves
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/fr/petit-outillage/groupe/verrerie-generale-contenants
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/fr/lab-equipment/groupe/does-not-exist
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/fr/lab-equipment/bains
```

Expected: `200` for all except the `does-not-exist` group (`404`) — the last one confirms the untouched `[subcategory]/page.tsx` still resolves a real subcategory slug correctly after the parent route's rewrite.

- [ ] **Step 3: Visual check in browser**

Open `http://localhost:3000/fr/lab-equipment` and `http://localhost:3000/fr/petit-outillage` — confirm 10 image cards render (not 57/81 products), each links into a `/groupe/<key>` page showing a plain text list of that group's subcategories, and each of those subcategory links lands on the existing product-grid page. Open `http://localhost:3000/fr/chemicals` — confirm 12 image cards (no group layer), each linking straight to a subcategory's product grid.

- [ ] **Step 4: Stop the dev server**

No commit for this task — it's verification only, folds into the final review before merge (see `superpowers:finishing-a-development-branch`).

---

## Self-review notes

- **Spec coverage:** data model (Task 1, 2), backfill script (Task 3), grouped query (Task 4), routes for `lab-equipment`/`petit-outillage` roots + `groupe/[group]` pages (Tasks 7, 8), flat `chemicals` grid (Task 9), `[subcategory]/page.tsx` explicitly left untouched (verified in Task 11 Step 2's last curl), glassware retirement + redirect (Task 10), images confirmed pre-existing (no task needed), out-of-scope items (no per-subcategory images, no product/admin/checkout changes) respected by construction — no task touches those files.
- **Corrected from spec:** Task 10 documents that `Header.tsx` had no `/glassware` link to update; the real stale links were in `ServicesSection.tsx` and `shop/page.tsx`, both handled instead.
- **No placeholders:** every task has literal code, exact file:line anchors, and runnable verification commands — no "add appropriate handling" or "similar to Task N" shortcuts.
