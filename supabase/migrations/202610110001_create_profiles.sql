create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[a-zA-Z0-9_.-]{3,24}$'),
  age integer check (age is null or age between 13 and 120),
  body_weight_kg numeric(5, 2) check (body_weight_kg is null or body_weight_kg between 20 and 400),
  equipment text[] not null default array['bodyweight', 'dumbbell']::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_equipment_allowed check (
    equipment <@ array[
      'bodyweight', 'dumbbell', 'kettlebell', 'barbell', 'machine',
      'cable-machine', 'rowing-machine', 'stationary-bike', 'pull-up-bar'
    ]::text[]
  )
);

create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username));

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_profile_updated_at();