# The Clean Club — Setup Guide

This document covers everything needed to configure the Clean Club membership system: Supabase (auth + database) and Stripe Billing (Bacs Direct Debit subscriptions).

The rest of the CF Hub UK site is unaffected — this system is scoped entirely to `/cleaning/*` routes and a handful of new `/api/*` serverless functions.

## 1. Environment variables

Add these to your `.env.local` (for local dev) and to your Vercel project's Environment Variables (for production/preview). Nothing here has real values checked into the repo.

### Client-side (exposed to the browser — must be prefixed `VITE_`)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL, e.g. `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public API key |
| `VITE_SITE_URL` | Public site URL, e.g. `https://www.cfhubuk.com` (used for Stripe redirect URLs) |

### Server-side only (used in `/api` functions — never exposed to the browser)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Same Supabase project URL as above (server-side lookup) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service role** key — Project Settings → API. Keep secret. |
| `STRIPE_SECRET_KEY` | Stripe secret key (test: `sk_test_...`, live: `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the `/api/stripe-webhook` endpoint (see step 4) |
| `STRIPE_PRICE_BRONZE` | Stripe Price ID for the Bronze plan (£79/month) |
| `STRIPE_PRICE_SILVER` | Stripe Price ID for the Silver plan (£149/month) |
| `STRIPE_PRICE_GOLD` | Stripe Price ID for the Gold plan (£279/month) |
| `STRIPE_PRICE_PLATINUM` | Stripe Price ID for the Platinum plan (£399/month) |
| `IDEAL_POSTCODES_API_KEY` | API key for [Ideal Postcodes](https://ideal-postcodes.co.uk) — powers the postcode → address lookup on sign-up |

Existing variables (`RESEND_API_KEY`, etc.) are unchanged.

## 2. Supabase project setup

1. Create a Supabase project (or use an existing one).
2. Run the migration in `supabase/migrations/0001_clean_club.sql` — either:
   - Paste its contents into the Supabase SQL Editor and run it, or
   - `supabase db push` if you use the Supabase CLI locally.
3. This creates: `profiles`, `memberships`, `subscriptions`, `bookings`, `payments`, `cleaners`, `admin_users`, all with Row Level Security enabled and a trigger that auto-creates a `profiles` row whenever a new `auth.users` row is created (covers both email/password and Google sign-ups).
4. **Enable Google OAuth**: Supabase Dashboard → Authentication → Providers → Google. Add your Google OAuth Client ID/Secret, and add your site's callback URL to the Google Cloud Console's authorized redirect URIs (Supabase shows the exact callback URL to use).
5. Copy the Project URL and anon key into `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, and the service role key into `SUPABASE_SERVICE_ROLE_KEY` (+ `SUPABASE_URL`).

## 2a. Email OTP via Resend (required — manual, one-time)

Sign-up verification and password reset both use a 6-digit code emailed through your existing Resend account, delivered via Supabase's built-in OTP support. Two manual steps in the Supabase Dashboard (not automatable via API):

1. **Custom SMTP**: Project Settings → Authentication → SMTP Settings → enable custom SMTP:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: your `RESEND_API_KEY`
   - Sender email: a verified address on your Resend domain (e.g. `noreply@cfhubuk.com`)
2. **Email templates**: Authentication → Email Templates:
   - "Confirm signup" → edit the body to include `{{ .Token }}` (the 6-digit code) instead of the default `{{ .ConfirmationURL }}` link.
   - "Reset password" (Magic Link/Recovery template) → same change, use `{{ .Token }}`.

Until both steps are done, Supabase's default email templates will still send a link instead of a code, and the app's OTP entry screens (`/cleaning/verify-email`, `/cleaning/reset-password`) won't have a matching code to check against.

## 3. Stripe setup

1. In the Stripe Dashboard, create 4 Products, each with one recurring monthly Price in GBP:
   - Bronze — £79/month
   - Silver — £149/month
   - Gold — £279/month
   - Platinum — £399/month
2. Copy each Price ID (`price_...`) into `STRIPE_PRICE_BRONZE` / `SILVER` / `GOLD` / `PLATINUM`.
3. **Enable Bacs Direct Debit**: Stripe Dashboard → Settings → Payment methods → enable "Bacs Direct Debit" (requires a UK Stripe account). The checkout flow requests `bacs_debit` as the only payment method.
4. Copy your Stripe secret key into `STRIPE_SECRET_KEY`.

## 4. Stripe webhook

1. In Stripe Dashboard → Developers → Webhooks, add an endpoint pointing to:
   `https://<your-domain>/api/stripe-webhook`
2. Subscribe to these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
3. Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`.
4. For local testing, use the Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe-webhook` (use the CLI's own signing secret locally).

Note: because Bacs Direct Debit payments take several days to confirm, `checkout.session.completed` activates the membership optimistically; `invoice.paid` / `invoice.payment_failed` and `customer.subscription.updated` keep status in sync afterwards.

## 5. Ideal Postcodes (address lookup)

1. Get an API key from [ideal-postcodes.co.uk](https://ideal-postcodes.co.uk) and put it in `IDEAL_POSTCODES_API_KEY` (server-side only — never `VITE_`-prefixed, so it's never exposed to the browser).
2. No further setup needed — `/api/postcode-lookup` proxies requests server-side.

## 6. What's included in this phase

- Supabase auth: sign up (with phone + postcode/address lookup), sign in, Google OAuth, forgot/reset password (both via 6-digit email OTP), sign out.
- Clean Club pricing page at `/cleaning/membership` (public) with "Start Now" per plan → the guided signup wizard at `/cleaning/membership/join` (details → plan confirm → schedule → Stripe Checkout).
- Customer dashboard at `/cleaning/dashboard` (overview, membership management/upgrade/downgrade/cancel via Stripe Billing Portal, upcoming cleans, payment history, profile).
- Database schema + RLS for `profiles`, `memberships`, `subscriptions`, `bookings`, `payments`, plus future-proofed `cleaners` and `admin_users` tables (no client access yet).

**Not included in this phase**: the admin dashboard (customer/booking/payment management, calendar, cleaner assignment). The schema already supports it — it will be built as a follow-up phase.

## 6. Local development

```bash
npm install
npm run dev
```

Ensure `.env.local` has all the `VITE_*` variables above set — without them, Supabase calls will fail with a clear console error rather than crashing the app.
