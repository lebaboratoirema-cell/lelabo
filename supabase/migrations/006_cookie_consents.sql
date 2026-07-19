create table cookie_consents (
  id          uuid        primary key default gen_random_uuid(),
  choice      text        not null check (choice in ('accepted','rejected')),
  locale      text        not null,
  ip_hash     text        not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

alter table cookie_consents enable row level security;

create policy "anon can insert own consent"
  on cookie_consents for insert
  to anon
  with check (true);
