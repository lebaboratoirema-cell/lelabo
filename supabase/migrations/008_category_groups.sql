alter table categories
  add column group_key text,
  add column group_label jsonb;

create index categories_group_key_idx on categories (parent_id, group_key);
