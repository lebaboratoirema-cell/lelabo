# Database Schema Design — Le Laboratoire

**Date:** 2026-06-20  
**Status:** Approved  
**Scope:** Supabase Postgres schema for product catalog + orders

---

## Context

E-commerce site selling laboratory equipment and chemicals to customers in Morocco. Stack: Next.js 16 + Supabase (Postgres, Auth, Storage). Compliance: Law 09-08 / CNDP.

---

## Decisions

- **Approach A — Mandatory variant:** every product has ≥1 variant. Price and stock live on `product_variants` only. Equipment gets one variant named `{"fr": "Standard", "en": "Standard"}`. Chemicals get many (500 mL, 1 L, 2.5 L…).
- **Bilingual content:** `name` and `description` fields stored as `jsonb` with shape `{"fr": "...", "en": "..."}`.
- **Order snapshots:** `order_items` copies `product_name`, `variant_name`, and `unit_price` at order time so historical orders survive catalog edits.
- **RLS:** public gets read-only access to active catalog rows; orders/order_items are service_role only (PII).

---

## Tables

### `categories`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| parent_id | uuid FK→categories | nullable — subcategories |
| slug | text UNIQUE | URL-safe identifier |
| name | jsonb | `{"fr": "...", "en": "..."}` |
| description | jsonb | nullable |
| image_url | text | nullable |
| position | int | display order, default 0 |
| is_active | bool | default true |
| created_at | timestamptz | default now() |

---

### `products`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| category_id | uuid FK→categories | NOT NULL |
| slug | text UNIQUE | |
| name | jsonb | `{"fr": "...", "en": "..."}` |
| description | jsonb | nullable |
| brand | text | nullable |
| is_active | bool | default true |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

No price column — price lives on variants only.

---

### `product_variants`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| product_id | uuid FK→products | NOT NULL |
| name | jsonb | `{"fr": "500 mL", "en": "500 mL"}` or `{"fr": "Standard", "en": "Standard"}` |
| sku | text UNIQUE | |
| price | numeric(10,2) | NOT NULL |
| stock | int | default 0 |
| position | int | ordering within product, default 0 |
| is_active | bool | default true |
| created_at | timestamptz | default now() |

---

### `product_images`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| product_id | uuid FK→products | NOT NULL |
| storage_path | text | Supabase Storage path (not full URL) |
| alt | jsonb | nullable, `{"fr": "...", "en": "..."}` |
| position | int | default 0 |
| is_primary | bool | default false |
| created_at | timestamptz | default now() |

---

### `orders`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| reference | text UNIQUE | e.g. `ORD-2026-00001` |
| customer_name | text | PII — Law 09-08 |
| customer_email | text | PII — Law 09-08 |
| customer_phone | text | PII — Law 09-08 |
| shipping_address | jsonb | `{street, city, province, postal_code}` — PII |
| status | text | `pending\|confirmed\|processing\|shipped\|delivered\|cancelled` |
| payment_method | text | `cmi\|cod` |
| payment_status | text | `pending\|paid\|failed\|refunded` |
| cmi_transaction_id | text | nullable |
| subtotal | numeric(10,2) | |
| shipping_cost | numeric(10,2) | default 0 |
| total | numeric(10,2) | |
| notes | text | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

---

### `order_items`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| order_id | uuid FK→orders | NOT NULL |
| product_id | uuid FK→products | NOT NULL |
| variant_id | uuid FK→product_variants | NOT NULL |
| product_name | jsonb | SNAPSHOT at order time |
| variant_name | jsonb | SNAPSHOT at order time |
| unit_price | numeric(10,2) | SNAPSHOT at order time |
| quantity | int | NOT NULL |
| subtotal | numeric(10,2) | unit_price × quantity |
| created_at | timestamptz | default now() |

---

## Row Level Security

| Table | anon (public) | service_role |
|---|---|---|
| categories | SELECT where is_active = true | ALL |
| products | SELECT where is_active = true | ALL |
| product_variants | SELECT where is_active = true | ALL |
| product_images | SELECT | ALL |
| orders | NONE | ALL |
| order_items | NONE | ALL |

---

## Law 09-08 / CNDP Compliance Notes

- `orders` table holds PII: name, email, phone, address.
- Data retention policy required: anonymise or delete after 5 years (flag for `compliance/regulatory-track.md`).
- No PII in frontend bundles or logs.
- Storage bucket for product images: public read, no customer data stored there.
