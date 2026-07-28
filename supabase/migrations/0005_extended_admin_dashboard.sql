-- Extended admin dashboard + customer dashboard schema
-- Run via `supabase db push` or paste into the Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- admin_users: support invite / first-time setup flow
-- ---------------------------------------------------------------------------
alter table public.admin_users alter column profile_id drop not null;
alter table public.admin_users add column if not exists invite_email text;
alter table public.admin_users add column if not exists full_name text;
alter table public.admin_users add column if not exists activated boolean not null default true;
alter table public.admin_users add column if not exists setup_token text;
alter table public.admin_users add column if not exists setup_token_expires_at timestamptz;
alter table public.admin_users add column if not exists role text not null default 'admin' check (role in ('admin', 'super_admin'));

create unique index if not exists idx_admin_users_setup_token on public.admin_users(setup_token) where setup_token is not null;

-- backfill full_name for existing activated admins from their linked profile
update public.admin_users a
set full_name = p.full_name
from public.profiles p
where a.profile_id = p.id and a.full_name is null;

-- ---------------------------------------------------------------------------
-- bookings: allow an in-progress state for "cleaner arrival" updates
-- ---------------------------------------------------------------------------
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('upcoming', 'in_progress', 'completed', 'cancelled'));

-- ---------------------------------------------------------------------------
-- saved_addresses
-- ---------------------------------------------------------------------------
create table if not exists public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  address text not null,
  postcode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.saved_addresses enable row level security;

create policy "saved_addresses_select_own" on public.saved_addresses
  for select using (auth.uid() = profile_id);
create policy "saved_addresses_insert_own" on public.saved_addresses
  for insert with check (auth.uid() = profile_id);
create policy "saved_addresses_update_own" on public.saved_addresses
  for update using (auth.uid() = profile_id);
create policy "saved_addresses_delete_own" on public.saved_addresses
  for delete using (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "reviews_select_own" on public.reviews
  for select using (auth.uid() = profile_id);
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- support_tickets
-- ---------------------------------------------------------------------------
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;

create policy "support_tickets_select_own" on public.support_tickets
  for select using (auth.uid() = profile_id);
create policy "support_tickets_insert_own" on public.support_tickets
  for insert with check (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- coupons (service-role managed, readable by any authenticated member if active)
-- ---------------------------------------------------------------------------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_percent int not null check (discount_percent between 1 and 100),
  active boolean not null default true,
  expires_at timestamptz,
  usage_limit int,
  times_used int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;

create policy "coupons_select_active" on public.coupons
  for select using (auth.role() = 'authenticated' and active = true);

-- ---------------------------------------------------------------------------
-- audit_logs (service-role only)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_email text,
  action text not null,
  target_type text,
  target_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;
-- no client policies: service-role only

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_saved_addresses_profile_id on public.saved_addresses(profile_id);
create index if not exists idx_reviews_profile_id on public.reviews(profile_id);
create index if not exists idx_support_tickets_profile_id on public.support_tickets(profile_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
