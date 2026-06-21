---
name: product-detail-page
description: Product detail pages with image gallery, variant pills, quote modal — nested under existing category/subcategory URL structure
metadata:
  type: project
---

# Product Detail Page — Design Spec

**Date:** 2026-06-21  
**Status:** Approved

---

## Problem

Products exist in the DB but clicking a product card goes to `/fr/contact`, not a dedicated product page. Users have no way to see product details, images, variants, or specs before requesting a quote.

---

## Goals

1. Every product has a dedicated public page at its canonical URL
2. Products **with variants** (e.g. glassware): show image gallery + variant pill selectors + "Add to quote" with quantity
3. Products **without variants** (e.g. equipment): show name, images, description + "Demander un devis" → opens quote modal
4. Quote modal: client fills name/email/phone/message; product name (+ selected variant if applicable) pre-filled in message
5. Product cards in `ProductGrid` become links to product pages
6. URLs stay nested in category/subcategory context

---

## URL Structure

| Scenario | URL |
|----------|-----|
| Product in subcategory | `/fr/glassware/beakers/beaker-1000ml` |
| Product directly in parent (no subcategory) | `/fr/lab-equipment/four-a-moufle` |
| Same for chemicals | `/fr/chemicals/acides/acide-chlorhydrique` |

**Routing logic for `/fr/[family]/[slug]`:**
1. Try `slug` as a category slug → render subcategory page (existing behavior)
2. Else try `slug` as a product slug under the parent → render product page
3. Else → 404

**Routing logic for `/fr/[family]/[subcategory]/[product]`:**
1. Verify `subcategory` is a valid child category of the family → else 404
2. Verify `product` belongs to that subcategory → else 404
3. Render product page

---

## Architecture

No schema changes. New shared component. Modified query file. Modified route files.

### Data layer — `src/lib/supabase/queries.ts`

Add two queries:

```ts
export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null>
```
Returns product + all active variants (ordered by position) + all images (ordered by position, primary first). Returns `null` if not found or inactive.

```ts
export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 3): Promise<ProductWithImage[]>
```
Fetches `limit` active products from same category, excluding current product. Used for "Related products" section.

---

### Route files

#### Modified — `[subcategory]/page.tsx` (×3)

`chemicals/[subcategory]/page.tsx`, `glassware/[subcategory]/page.tsx`, `lab-equipment/[subcategory]/page.tsx`

Current behavior: fetch category by slug, 404 if not found.  
New behavior:
1. Fetch category by slug → if found, render subcategory page (unchanged)
2. Else fetch product by slug under the parent category → if found, render `<ProductDetailPage>`
3. Else → `notFound()`

#### New — `[subcategory]/[product]/page.tsx` (×3)

`chemicals/[subcategory]/[product]/page.tsx`  
`glassware/[subcategory]/[product]/page.tsx`  
`lab-equipment/[subcategory]/[product]/page.tsx`

1. Fetch category by `subcategory` slug, verify it is child of the correct family parent → else `notFound()`
2. Fetch product by `product` slug, verify `category_id` matches the subcategory → else `notFound()`
3. Render `<ProductDetailPage>`

Both page types: `export const dynamic = 'force-dynamic'`

---

### Shared component — `src/components/ProductDetailPage.tsx`

Server component. Receives `product: ProductWithVariants` and `related: ProductWithImage[]`.

**Layout (matches design):**

**Left column — image gallery**
- Primary image large with hover-zoom (CSS transform, client island)
- Thumbnail strip below (client island for active state)
- "In stock" badge (hardcoded for MVP — no stock field in schema)

**Right column — product info**
- Brand + product name (`h1`)
- Short description (`pd-lead`)
- "On request / Sur demande" price label
- **Variant section** — rendered only if `product.product_variants.length > 0`:
  - Pill selector for each variant (variant `name.fr` as label)
  - Selected variant name shown inline
  - No quantity input needed — quote flow handles qty
- **CTA button** — "Demander un devis" (both with and without variants)
  - With variants: button disabled until a variant is selected
  - Without variants: always enabled
- Product meta: SKU (variant SKU if selected, else product slug), category breadcrumb links
- Share links (Facebook, WhatsApp, Email)

**Trust badges strip** (4 badges: Livraison nationale, Retours 7 jours, Qualité certifiée, Conseil technique)

**Tabs section** (client island):
- Description tab: `product.description.fr` rendered as prose
- Specifications tab: brand, category — expandable for future fields
- Livraison & retours tab: static text (same as design)

**Related products** — `ProductGrid` with 3 cards at bottom

---

### Quote modal — `src/components/QuoteModal.tsx`

Client component. Triggered by "Demander un devis" button.

State: `open: boolean`, controlled from `ProductDetailPage` via `useState` wrapper (make `ProductDetailPage` a client component, or extract a small `QuoteButton` client island).

**Recommended:** Extract `QuoteButton` + `QuoteModal` as a single client island. `ProductDetailPage` stays server component and passes product name + selected variant name as props to the island.

**Modal contents:**
- Overlay backdrop (click outside to close)
- Close button (×)
- Heading: "Demander un devis"
- Product name shown (read-only, styled as context)
- Form fields:
  - Nom complet (required)
  - Email (required, type=email)
  - Téléphone (optional, type=tel)
  - Message (textarea, pre-filled: `"Je souhaite un devis pour : [product name][– variant name if selected]"`)
- Submit button: "Envoyer la demande"
- Submit action: calls `submitQuote` server action (new file `src/app/[locale]/actions/quote.ts`) → logs request for MVP; email integration out of scope
- Success state: show confirmation message, auto-close after 3s
- Error state: show inline error, keep modal open

**MVP scope:** Server action logs the quote request to console / returns success. Email integration is out of scope for this spec.

---

### ProductGrid update — `src/components/ProductGrid.tsx`

Each product card becomes an `<a>` linking to the product's URL.

URL construction requires knowing the full path. Two options:
- Pass `basePath` prop to `ProductGrid` (e.g. `/fr/glassware/beakers`) — callers already know their path
- Or build URL from category slug chain in the query

**Recommended:** Add `basePath: string` prop to `ProductGrid`. All callers pass their current path. Card href = `${basePath}/${product.slug}`.

---

## Files changed

| File | Change |
|------|--------|
| `src/lib/supabase/queries.ts` | Add `getProductBySlug`, `getRelatedProducts` |
| `src/app/[locale]/chemicals/[subcategory]/page.tsx` | Try category slug first, else try product slug |
| `src/app/[locale]/glassware/[subcategory]/page.tsx` | Same |
| `src/app/[locale]/lab-equipment/[subcategory]/page.tsx` | Same |
| `src/app/[locale]/chemicals/[subcategory]/[product]/page.tsx` | **New** — product under subcategory |
| `src/app/[locale]/glassware/[subcategory]/[product]/page.tsx` | **New** — product under subcategory |
| `src/app/[locale]/lab-equipment/[subcategory]/[product]/page.tsx` | **New** — product under subcategory |
| `src/components/ProductDetailPage.tsx` | **New** — shared product detail layout |
| `src/components/QuoteModal.tsx` | **New** — client modal with quote form |
| `src/components/ProductGrid.tsx` | Add `basePath` prop, wrap cards in `<a>` |
| `src/app/[locale]/actions/quote.ts` | **New** — `submitQuote` server action for quote form |

**Total: 11 files. No schema changes.**

---

## Error handling

- `getProductBySlug` returns `null` on DB error or missing product → caller renders `notFound()`
- `getRelatedProducts` returns `[]` on error → related section simply absent
- Quote form: client-side validation before submit; server action returns `{ success: boolean; error?: string }`
- If product has variants and none selected, "Demander un devis" button is `disabled` with `aria-disabled`

---

## Testing

1. Click product card on `/fr/glassware/beakers` → lands on `/fr/glassware/beakers/[slug]`
2. Product with variants → variant pills render, button disabled until pill selected, modal opens with variant name in message
3. Product without variants → no pill section, button always enabled, modal opens with product name only
4. Quote form: fill fields → submit → success message shown
5. Click product card on `/fr/lab-equipment` (parent, no subcategory) → lands on `/fr/lab-equipment/[slug]`
6. Unknown slug → 404
7. Related products show 3 cards from same category, each card links to its own product page
