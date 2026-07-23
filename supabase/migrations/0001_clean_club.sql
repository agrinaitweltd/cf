-- Clean Club membership system schema
-- Run via `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  address text,
  postcode text,
  emergency_contact text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- new auth.users row -> profiles row (covers email/password and OAuth sign ups)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- memberships
-- ---------------------------------------------------------------------------
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  tier text not null check (tier in ('bronze', 'silver', 'gold', 'platinum')),
  status text not null default 'pending' check (status in ('pending', 'active', 'paused', 'cancelled')),
  preferred_day text check (preferred_day in ('monday','tuesday','wednesday','thursday','friday','saturday')),
  preferred_time text check (preferred_time in ('morning','afternoon','evening')),
  preferred_start_date date,
  special_instructions text,
  created_at timestamptz not null default now()
);

alter table public.memberships enable row level security;

create policy "memberships_select_own" on public.memberships
  for select using (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- subscriptions (Stripe source of truth, written by the webhook only)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  membership_id uuid references public.memberships(id) on delete set null,
  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'incomplete',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- cleaners (future-proofing for Phase 2 admin dashboard)
-- ---------------------------------------------------------------------------
create table if not exists public.cleaners (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cleaners enable row level security;
-- no client policies: service-role only until Phase 2

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  membership_id uuid references public.memberships(id) on delete set null,
  scheduled_date date not null,
  scheduled_time text check (scheduled_time in ('morning','afternoon','evening')),
  status text not null default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled')),
  assigned_cleaner_id uuid references public.cleaners(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "bookings_select_own" on public.bookings
  for select using (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  stripe_invoice_id text unique,
  amount numeric(10,2) not null,
  currency text not null default 'gbp',
  status text not null,
  invoice_pdf_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "payments_select_own" on public.payments
  for select using (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- admin_users (future-proofing for Phase 2 admin dashboard)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- no client policies: service-role only until Phase 2

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_memberships_profile_id on public.memberships(profile_id);
create index if not exists idx_subscriptions_profile_id on public.subscriptions(profile_id);
create index if not exists idx_bookings_profile_id on public.bookings(profile_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_payments_profile_id on public.payments(profile_id);
