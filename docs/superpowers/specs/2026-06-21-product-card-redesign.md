# Product Card Redesign — Simplified with Stock & Promo Badge

**Date:** 2026-06-21
**Status:** Approved

## Goal

Simplify the public-facing product grid card to show only what matters for quick scanning: product image, name, stock availability, and an optional promotional badge. Remove description, price line, and brand tag.

## Database Changes

Two new columns on the `products` table:

```sql
ALTER TABLE products
  ADD COLUMN in_stock boolean NOT NULL DEFAULT false,
  ADD COLUMN promo_label varchar(20) NULL;
```

- `in_stock` — admin-controlled boolean; `false` by default
- `promo_label` — free text up to 20 chars (e.g. `"-25%"`, `"SOLDES"`); `NULL` = no badge shown

## Card Layout

```
┌─────────────────────────┐
│ [-25%]                  │  ← promo_label badge: red pill, position absolute top-left over image
│                         │
│                         │
│ [● En stock]            │  ← stock badge: green dot + "En stock" / gray + "Sur commande", bottom-left of image
├─────────────────────────┤
│ Nom du produit          │  ← h3 name only
└─────────────────────────┘
```

### Promo badge (`.promo-badge`)
- Position: `absolute; top: 14px; left: 14px` inside `.pimg`
- Style: `background: #dc2626; color: #fff; font-size: 12px; font-weight: 700; padding: 5px 10px; border-radius: 30px`
- Rendered only when `promo_label` is non-null and non-empty

### Stock badge (`.stock-badge`)
- Position: `absolute; bottom: 12px; left: 14px` inside `.pimg`
- In stock: green dot `#16a34a` + text "En stock"
- Out of stock: gray dot `#9ca3af` + text "Sur commande"
- Style: `background: rgba(255,255,255,0.92); font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 30px`

### Card body
- Keep: `<h3>` product name
- Remove: `<p>` description, `.pfoot` (price + "Voir →"), brand `.tag`

## Files Changed

| File | Change |
|------|--------|
| `app/src/types/database.ts` | Add `in_stock: boolean` and `promo_label: string \| null` to `Product` interface |
| `app/src/lib/supabase/queries.ts` | No query change needed — `select('*', ...)` already fetches all product columns |
| `app/src/components/ProductGrid.tsx` | Strip description/price/brand; add `.promo-badge` and `.stock-badge` |
| `app/src/app/globals.css` | Add `.promo-badge` and `.stock-badge` styles |
| `app/src/app/[locale]/admin/products/_components/ProductForm.tsx` | Add `in_stock` checkbox and `promo_label` text input |
| `app/src/app/[locale]/admin/products/_components/actions.ts` | Parse and persist `in_stock` and `promo_label` in create/update |

## Admin Form Fields

**`in_stock`** — checkbox, label "En stock", default unchecked on new products.

**`promo_label`** — text input, maxlength 20, placeholder `"-25%"`, label "Badge promo (laisser vide pour masquer)".

Both fields appear in the product settings section of the existing admin form.

## Out of Scope

- Automatic stock calculation from variant quantities (admin sets manually)
- Multilingual promo label (single value, displayed as-is)
- Promo badge on product detail page (separate feature)
