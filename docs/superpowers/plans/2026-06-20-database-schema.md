# Database Schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create all six Postgres tables in Supabase with RLS, triggers, Storage bucket, and TypeScript types.

**Architecture:** SQL migration file written locally, pasted into Supabase SQL editor to execute. TypeScript types hand-written to match schema (no Supabase CLI required). Storage bucket created via Supabase dashboard.

**Tech Stack:** Supabase Postgres, `@supabase/supabase-js`, TypeScript

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `supabase/migrations/001_initial_schema.sql` | Create | Full SQL to run in Supabase SQL editor |
| `app/src/types/database.ts` | Create | TypeScript types matching schema |

---

## Task 1: Write SQL migration file

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create migration file with complete SQL**

Create `supabase/migrations/001_initial_schema.sql` with this exact content:

```sql
-- ============================================================
-- Le Laboratoire — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- updated_at auto-update trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Order reference sequence: ORD-YYYY-00001
create sequence if not exists order_reference_seq start 1;

create or replace function generate_order_reference()
returns text as $$
begin
  return 'ORD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_reference_seq')::text, 5, '0');
end;
$$ language plpgsql;

-- ============================================================
-- CATALOG TABLES
-- ============================================================

create table categories (
  id          uuid        primary key default gen_random_uuid(),
  parent_id   uuid        references categories(id) on delete set null,
  slug        text        unique not null,
  name        jsonb       not null,
  description jsonb,
  image_url   text,
  position    int         not null default 0,
  is_active   bool        not null default true,
  created_at  timestamptz not null default now()
);

create table products (
  id          uuid        primary key default gen_random_uuid(),
  category_id uuid        not null references categories(id) on delete restrict,
  slug        text        unique not null,
  name        jsonb       not null,
  description jsonb,
  brand       text,
  is_active   bool        not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

create table product_variants (
  id         uuid        primary key default gen_random_uuid(),
  product_id uuid        not null references products(id) on delete cascade,
  name       jsonb       not null,
  sku        text        unique not null,
  price      numeric(10,2) not null check (price >= 0),
  stock      int         not null default 0 check (stock >= 0),
  position   int         not null default 0,
  is_active  bool        not null default true,
  created_at timestamptz not null default now()
);

create table product_images (
  id           uuid        primary key default gen_random_uuid(),
  product_id   uuid        not null references products(id) on delete cascade,
  storage_path text        not null,
  alt          jsonb,
  position     int         not null default 0,
  is_primary   bool        not null default false,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- ORDER TABLES
-- ============================================================

create table orders (
  id                 uuid        primary key default gen_random_uuid(),
  reference          text        unique not null default generate_order_reference(),
  customer_name      text        not null,
  customer_email     text        not null,
  customer_phone     text        not null,
  shipping_address   jsonb       not null,
  status             text        not null default 'pending'
                                 check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_method     text        not null
                                 check (payment_method in ('cmi','cod')),
  payment_status     text        not null default 'pending'
                                 check (payment_status in ('pending','paid','failed','refunded')),
  cmi_transaction_id text,
  subtotal           numeric(10,2) not null check (subtotal >= 0),
  shipping_cost      numeric(10,2) not null default 0 check (shipping_cost >= 0),
  total              numeric(10,2) not null check (total >= 0),
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

create table order_items (
  id           uuid        primary key default gen_random_uuid(),
  order_id     uuid        not null references orders(id) on delete cascade,
  product_id   uuid        not null references products(id) on delete restrict,
  variant_id   uuid        not null references product_variants(id) on delete restrict,
  product_name jsonb       not null,
  variant_name jsonb       not null,
  unit_price   numeric(10,2) not null check (unit_price >= 0),
  quantity     int         not null check (quantity > 0),
  subtotal     numeric(10,2) not null check (subtotal >= 0),
  created_at   timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table categories      enable row level security;
alter table products        enable row level security;
alter table product_variants enable row level security;
alter table product_images  enable row level security;
alter table orders          enable row level security;
alter table order_items     enable row level security;

-- Catalog: public read for active rows
create policy "categories_public_read" on categories
  for select to anon, authenticated
  using (is_active = true);

create policy "products_public_read" on products
  for select to anon, authenticated
  using (is_active = true);

create policy "product_variants_public_read" on product_variants
  for select to anon, authenticated
  using (is_active = true);

create policy "product_images_public_read" on product_images
  for select to anon, authenticated
  using (true);

-- Orders: no public access (service_role bypasses RLS automatically)
-- No policies on orders / order_items — only service_role key can access them.
```

- [ ] **Step 2: Commit migration file**

```bash
git add supabase/migrations/001_initial_schema.sql
git commit -m "feat(db): add initial schema migration SQL"
```

---

## Task 2: Run migration in Supabase

**Files:** None (manual step in Supabase dashboard)

- [ ] **Step 1: Open Supabase SQL editor**

Go to: `https://supabase.com/dashboard/project/csqqidizkqjxfgytwwcu/sql/new`

- [ ] **Step 2: Paste and run**

Copy the entire contents of `supabase/migrations/001_initial_schema.sql` → paste into editor → click **Run** (or Ctrl+Enter).

Expected: green "Success. No rows returned." banner.

- [ ] **Step 3: Verify tables created**

In Supabase SQL editor, run this verification query:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('categories','products','product_variants','product_images','orders','order_items')
order by table_name;
```

Expected output — 6 rows:
```
categories
order_items
orders
product_images
product_variants
products
```

- [ ] **Step 4: Verify RLS enabled**

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('categories','products','product_variants','product_images','orders','order_items')
order by tablename;
```

Expected: `rowsecurity = true` for all 6 rows.

- [ ] **Step 5: Verify updated_at trigger fires**

```sql
-- Insert test category
insert into categories (slug, name) values ('test', '{"fr":"Test","en":"Test"}');

-- Update it
update categories set position = 1 where slug = 'test';

-- Verify created_at ≠ updated_at is not applicable (categories has no updated_at)
-- Instead verify products trigger:
insert into products (category_id, slug, name)
select id, 'test-prod', '{"fr":"Produit Test","en":"Test Product"}'
from categories where slug = 'test';

-- Wait 1 second in your head, then:
update products set brand = 'TestBrand' where slug = 'test-prod';

select slug, created_at, updated_at,
       (updated_at > created_at) as trigger_fired
from products where slug = 'test-prod';
```

Expected: `trigger_fired = true`.

- [ ] **Step 6: Clean up test data**

```sql
delete from products where slug = 'test-prod';
delete from categories where slug = 'test';
```

- [ ] **Step 7: Verify order reference generation**

```sql
insert into orders (
  customer_name, customer_email, customer_phone,
  shipping_address, payment_method,
  subtotal, total
) values (
  'Test Client', 'test@example.com', '+212600000000',
  '{"street":"123 Rue Test","city":"Casablanca","province":"Casablanca-Settat","postal_code":"20000"}',
  'cod', 100.00, 100.00
)
returning reference;
```

Expected: `reference = 'ORD-2026-00001'`

```sql
-- Clean up
delete from orders where customer_email = 'test@example.com';
```

---

## Task 3: Create Supabase Storage bucket for product images

**Files:** None (manual step in Supabase dashboard)

- [ ] **Step 1: Open Storage dashboard**

Go to: `https://supabase.com/dashboard/project/csqqidizkqjxfgytwwcu/storage/buckets`

- [ ] **Step 2: Create bucket**

Click **New bucket** → set:
- Name: `product-images`
- Public bucket: **ON** (product images are public)
- File size limit: `5 MB`
- Allowed MIME types: `image/jpeg, image/png, image/webp`

Click **Save**.

- [ ] **Step 3: Verify bucket accessible**

In SQL editor:
```sql
select name, public from storage.buckets where name = 'product-images';
```

Expected: `public = true`.

---

## Task 4: Write TypeScript types

**Files:**
- Create: `app/src/types/database.ts`

- [ ] **Step 1: Create TypeScript types file**

Create `app/src/types/database.ts`:

```typescript
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type BilingualText = { fr: string; en: string };

export type ShippingAddress = {
  street: string;
  city: string;
  province: string;
  postal_code: string;
};

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cmi' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Category {
  id: string;
  parent_id: string | null;
  slug: string;
  name: BilingualText;
  description: BilingualText | null;
  image_url: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  slug: string;
  name: BilingualText;
  description: BilingualText | null;
  brand: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: BilingualText;
  sku: string;
  price: number;
  stock: number;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt: BilingualText | null;
  position: number;
  is_primary: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  cmi_transaction_id: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: BilingualText;
  variant_name: BilingualText;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

// Joined types used in queries

export interface ProductWithVariants extends Product {
  product_variants: ProductVariant[];
  product_images: ProductImage[];
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
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
git commit -m "feat(db): add TypeScript types for database schema"
```

---

## Task 5: Update compliance doc

**Files:**
- Modify: `compliance/regulatory-track.md`

- [ ] **Step 1: Add PII retention note**

Open `compliance/regulatory-track.md` and add this entry under the relevant section (create a "Data Retention" section if none exists):

```markdown
## Data Retention (Law 09-08 / CNDP)

- **PII location:** `orders` table — customer_name, customer_email, customer_phone, shipping_address
- **Retention policy required:** anonymise or delete PII after 5 years per Law 09-08 Article 11
- **Status:** ⏳ Not yet implemented — flag before go-live
- **Implementation note:** Scheduled Supabase function or cron job to anonymise orders older than 5 years
```

- [ ] **Step 2: Commit**

```bash
git add compliance/regulatory-track.md
git commit -m "docs(compliance): note PII retention requirement for orders table"
```
