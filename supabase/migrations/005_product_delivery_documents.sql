alter table products
  add column delivery jsonb;

create table product_documents (
  id           uuid        primary key default gen_random_uuid(),
  product_id   uuid        not null references products(id) on delete cascade,
  storage_path text        not null,
  label        text        not null,
  position     int         not null default 0,
  created_at   timestamptz not null default now()
);
