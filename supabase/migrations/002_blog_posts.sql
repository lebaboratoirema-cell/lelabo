create table blog_posts (
  id           uuid        primary key default gen_random_uuid(),
  slug         text        unique not null,
  title        text        not null,
  excerpt      text,
  content      text        not null,
  cover_image  text,
  is_published boolean     not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index blog_posts_published_idx on blog_posts (published_at desc) where is_published;

alter table blog_posts enable row level security;

create policy "Public can read published posts"
  on blog_posts for select
  using (is_published = true);
