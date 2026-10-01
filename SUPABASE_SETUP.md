# Supabase setup for AgriSentinel X

## 1. Create the private app-state table

In your Supabase project, open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. Row-level security restricts each signed-in user to their own state row.

## 2. Add Vercel environment variables

In the Vercel project settings, add these for Production (and Preview if needed):

- `VITE_SUPABASE_URL`: the Project URL from Supabase **Project Settings → API**
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the project's publishable/anon key from **Project Settings → API Keys**

Then redeploy. These browser values are public by design; do not put a `service_role` or secret key in Vercel frontend variables or source code.

## 3. Configure Supabase Auth URLs

In Supabase **Authentication → URL Configuration**, set the Site URL to `https://agri-rust.vercel.app` and add `https://agri-rust.vercel.app/**` to the allowed redirect URLs. Add your local development URL there too if you plan to test locally.

The app uses email/password sign-in and farmer account sign-up. If email confirmation is enabled, confirm the email before signing in. Each account gets its own private app data; existing sample fixtures are not copied into Supabase accounts.

Without the two Vercel environment variables, the app stays in its clearly labeled demo mode.

