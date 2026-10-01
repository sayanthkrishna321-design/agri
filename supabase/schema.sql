create table if not exists public.user_app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_app_state enable row level security;
revoke all on table public.user_app_state from anon, authenticated;
grant select, insert, update, delete on table public.user_app_state to authenticated;

drop policy if exists "Users can read their own app state" on public.user_app_state;
create policy "Users can read their own app state"
  on public.user_app_state for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own app state" on public.user_app_state;
create policy "Users can create their own app state"
  on public.user_app_state for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own app state" on public.user_app_state;
create policy "Users can update their own app state"
  on public.user_app_state for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own app state" on public.user_app_state;
create policy "Users can delete their own app state"
  on public.user_app_state for delete to authenticated
  using ((select auth.uid()) = user_id);

