-- Adds date_of_birth so we can require full profile completion (name, age,
-- address, phone) before a customer reaches the dashboard — closes the gap
-- for Google sign-ups, which only ever provide name/email/photo.

alter table public.profiles add column if not exists date_of_birth date;
