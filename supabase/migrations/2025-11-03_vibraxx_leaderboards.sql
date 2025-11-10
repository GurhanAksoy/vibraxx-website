-- Enable UUID if needed
create extension if not exists "uuid-ossp";

-- Global synchronized rounds (server will create/start these)
create table if not exists rounds (
  id uuid primary key default uuid_generate_v4(),
  label text,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

-- Per-user completed round results
create table if not exists user_rounds (
  id uuid primary key default uuid_generate_v4(),
  round_id uuid references rounds(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  correct_count int not null default 0,
  wrong_count int not null default 0,
  accuracy int not null default 0, -- 0..100
  score int generated always as ((correct_count * 10) - (wrong_count * 2)) stored,
  duration_seconds int,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_user_rounds_round on user_rounds(round_id);
create index if not exists idx_user_rounds_user on user_rounds(user_id);
create index if not exists idx_user_rounds_created on user_rounds(created_at);

-- Simple read policies (adjust to your RLS model):
-- (Allow authenticated users to read leaderboard data)
-- comment out if you have custom RLS already
alter table user_rounds enable row level security;
do $$ begin
  create policy if not exists "user_rounds_read" on user_rounds
  for select using (true);
exception when duplicate_object then null; end $$;

alter table rounds enable row level security;
do $$ begin
  create policy if not exists "rounds_read" on rounds
  for select using (true);
exception when duplicate_object then null; end $$;
