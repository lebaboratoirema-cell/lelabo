alter table products
  add column is_featured boolean not null default false,
  add column featured_position integer;

create index products_featured_idx on products (is_featured, featured_position);
