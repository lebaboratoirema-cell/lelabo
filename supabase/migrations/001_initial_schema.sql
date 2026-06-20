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
