create extension if not exists "pgcrypto";

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  servings text not null default '',
  time text not null default '',
  level text not null default '',
  image_url text,
  ingredient_groups jsonb not null default '[]',
  steps jsonb not null default '[]',
  tips jsonb not null default '[]',
  raw_input text not null default '',
  chef_check jsonb,
  created_at timestamptz not null default now()
);
