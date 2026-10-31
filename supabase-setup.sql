-- Run in your Supabase project's SQL Editor.
-- Each user can access ONLY their own workout logs.
create table if not exists public.workout_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id text not null check (workout_id ~ '^WVID-[0-9]+$'),
  workout_date date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, workout_id, workout_date)
);
alter table public.workout_logs enable row level security;
create policy "Users read own workouts" on public.workout_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert own workouts" on public.workout_logs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users delete own workouts" on public.workout_logs for delete to authenticated using ((select auth.uid()) = user_id);
-- The website never updates a workout row, only inserts/deletes it.
