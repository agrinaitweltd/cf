-- Admin first-time setup: phone number + email OTP verification step

alter table public.admin_users add column if not exists phone text;
alter table public.admin_users add column if not exists setup_otp text;
alter table public.admin_users add column if not exists setup_otp_expires_at timestamptz;
