alter table blog_posts
  add column author text not null default 'lelaboratoire.ma',
  add column meta_description text;
