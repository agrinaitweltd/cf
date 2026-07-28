create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = profile_id);

create policy "notifications_insert_own" on public.notifications
  for insert with check (auth.uid() = profile_id);

create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = profile_id);

create index if not exists idx_notifications_profile_id on public.notifications(profile_id, created_at desc);

-- admin_users needs to be readable by the authenticated user themselves,
-- so the client can check "am I an admin?" without a server round trip.
create policy "admin_users_select_own" on public.admin_users
  for select using (auth.uid() = profile_id);
