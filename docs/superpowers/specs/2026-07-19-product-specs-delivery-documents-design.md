# Admin product form: specifications, delivery, documents

## Goal
Admin can edit product specifications, delivery info, and attach PDF documents (fiches techniques, certificats) from the product edit/create form.

## Schema changes (`supabase/migrations/005_product_delivery_documents.sql`)
- `products.delivery jsonb` — new column: `{ delay: string, weight_kg: number|null, dimensions: string, note: string, policy_text: string }`
- `product_documents` table — mirrors `product_images`:
  - `id uuid pk default gen_random_uuid()`
  - `product_id uuid not null references products(id) on delete cascade`
  - `storage_path text not null`
  - `label text not null`
  - `position int not null default 0`
  - `created_at timestamptz not null default now()`
- Storage bucket `product-documents` (public, PDF only) — **manual step**: create in Supabase dashboard, same settings as existing `product-images` bucket (no bucket-creation SQL exists in this repo for `product-images` either, so following existing convention).

`products.specifications jsonb` already exists (migration 004) — no schema change needed, only UI.

## Admin form (`ProductForm.tsx`)
Three new cards, same visual style as existing Détails/Images/Variantes cards.

**Spécifications** — key/value row list (add/remove rows), same interaction pattern as Variantes. Serialized to `specifications` jsonb: `{ [key]: value }`. Empty-key rows dropped on save.

**Livraison** — single card, 5 fields:
- Délai de livraison (text input)
- Poids, kg (number input)
- Dimensions (text input, free-form "L x l x H")
- Note de livraison (textarea)
- Texte politique de livraison (textarea)

Serialized to `delivery` jsonb.

**Documents** — same upload pattern as Images card (drag-to-add tile, file input) but `accept="application/pdf"`, and each existing/new doc has a label text input next to it (e.g. "Fiche technique"). Uploaded to `product-documents` bucket at `{productId}/{timestamp}-{i}.pdf`, row inserted into `product_documents`.

## Actions (`actions.ts`)
- `createProduct`/`updateProduct`: parse specs rows into jsonb object, parse delivery fields into jsonb object, include both in insert/update payload.
- New `uploadDocuments()` helper mirroring `uploadImages()`, called alongside it in both create/update.
- `deleteProduct`: also remove `product-documents` storage objects and `product_documents` rows for the product (mirrors existing image cleanup).

## Out of scope
- Public product page display of delivery/documents (follow-up if needed).
- External-link documents (uploads only, per earlier decision).
