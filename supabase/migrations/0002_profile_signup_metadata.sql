-- handle_new_user: also populate phone/postcode/address from signup metadata.
-- Needed because supabase.auth.signUp() does not establish a session when
-- email confirmation is required, so client-side profile updates immediately
-- after signUp() are blocked by RLS until the user verifies their email.
-- Passing these fields through auth metadata lets the trigger (which runs as
-- security definer) populate them at insert time instead.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, postcode, address, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'postcode',
    new.raw_user_meta_data->>'address',
    now()
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    postcode = coalesce(excluded.postcode, public.profiles.postcode),
    address = coalesce(excluded.address, public.profiles.address);
  return new;
end;
$$;
