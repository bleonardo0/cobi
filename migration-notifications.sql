-- Notifications system schema
-- Run this SQL in your Supabase project

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  -- Targeting
  user_id text null, -- Clerk user id (for admin or specific user)
  restaurant_id text null, -- Restaurant id (for restaurateurs)

  -- Content
  type text not null check (type in (
    'model_ready', 'model_failed', 'low_stock', 'price_inconsistency',
    'feedback_new', 'analytics_alert', 'task', 'system'
  )),
  title text not null,
  message text null,
  url text null,

  -- State
  read_at timestamp with time zone null,
  created_at timestamp with time zone not null default now()
);

-- Helpful indexes
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);
create index if not exists notifications_user_idx on public.notifications (user_id);
create index if not exists notifications_restaurant_idx on public.notifications (restaurant_id);
create index if not exists notifications_unread_idx on public.notifications (read_at) where read_at is null;

-- (Optional) simple RLS allowing read for anon and writes via service role only.
-- Adjust to your security model; current app uses server-side service key for writes/reads via API.
alter table public.notifications enable row level security;

do $$ begin
  create policy if not exists "Read notifications via anon" on public.notifications
    for select
    using (true);
exception when others then null; end $$;

-- No insert/update/delete policies here; keep those through service role in API.

-- Enable Realtime for this table
alter publication supabase_realtime add table public.notifications;


