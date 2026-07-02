create table if not exists error_logs (
  id uuid primary key default gen_random_uuid(),
  route text not null,
  message text not null,
  stack text,
  context jsonb,
  created_at timestamptz not null default now()
);
