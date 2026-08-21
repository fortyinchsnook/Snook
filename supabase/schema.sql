-- ============================================================
-- 40" SNOOK CLUB — database schema
-- Run this whole file in the Supabase SQL Editor (see README).
-- ============================================================

-- ---------- PROFILES ----------
-- one row per user, created automatically when they sign up
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null,
  county text,
  ig_url text,
  fb_url text,
  yt_url text,
  tiktok_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "profiles are publicly readable"
  on profiles for select
  using (true);

create policy "users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, handle)
  values (new.id, 'angler_' || substr(new.id::text, 1, 8));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- CATCHES ----------
create table if not exists catches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  length numeric not null check (length >= 22),
  verification text not null check (verification in ('certified', 'liar')),
  county text not null,
  spot_type text,
  lure text,
  photo_url text,
  created_at timestamptz default now()
);

alter table catches enable row level security;

create policy "catches are publicly readable"
  on catches for select
  using (true);

create policy "users can log their own catches"
  on catches for insert
  with check (auth.uid() = user_id);

create policy "users can delete their own catches"
  on catches for delete
  using (auth.uid() = user_id);

-- ---------- VOTES ----------
-- one vote per (user, catch) — the unique constraint is what makes
-- "vote once, but can switch thumbs" actually enforced by the database.
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  catch_id uuid references catches(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  value text not null check (value in ('agree', 'disagree')),
  created_at timestamptz default now(),
  unique (catch_id, user_id)
);

alter table votes enable row level security;

create policy "votes are publicly readable"
  on votes for select
  using (true);

create policy "users can cast their own vote"
  on votes for insert
  with check (auth.uid() = user_id);

create policy "users can change their own vote"
  on votes for update
  using (auth.uid() = user_id);

create policy "users can retract their own vote"
  on votes for delete
  using (auth.uid() = user_id);

-- ---------- STORAGE ----------
-- Run this too — creates the bucket catch photos get uploaded to.
insert into storage.buckets (id, name, public)
values ('catch-photos', 'catch-photos', true)
on conflict (id) do nothing;

create policy "catch photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'catch-photos');

create policy "authenticated users can upload catch photos"
  on storage.objects for insert
  with check (bucket_id = 'catch-photos' and auth.role() = 'authenticated');

-- ============================================================
-- MODERATION — flagging + email alerts
-- ============================================================

create table if not exists flags (
  id uuid primary key default gen_random_uuid(),
  catch_id uuid references catches(id) on delete cascade not null,
  reporter_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (catch_id, reporter_id) -- one flag per person per catch, no spam-clicking
);

alter table flags enable row level security;

-- deliberately no public select policy — only you (via the Supabase
-- dashboard's Table Editor, using your own login) can read flags.
-- Regular users can create a flag but never see who else flagged what.

create policy "users can flag a catch"
  on flags for insert
  with check (auth.uid() = reporter_id);
