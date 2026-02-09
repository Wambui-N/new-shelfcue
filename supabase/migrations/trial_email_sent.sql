-- Log table for trial lifecycle emails so we send each type at most once per user.
-- Used by /api/cron/trial-emails to avoid duplicate trial_reminder, trial_ending_soon, trial_expired emails.

create table if not exists public.trial_email_sent (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email_type text not null check (email_type in ('trial_reminder', 'trial_ending_soon', 'trial_expired')),
  sent_at timestamptz not null default now(),
  unique(user_id, email_type)
);

-- Allow service role and API to read/insert
alter table public.trial_email_sent enable row level security;

create policy "Service role can manage trial_email_sent"
  on public.trial_email_sent
  for all
  to service_role
  using (true)
  with check (true);

-- Index for cron: find users who have not yet received a given email type
create index if not exists trial_email_sent_user_id_email_type_idx
  on public.trial_email_sent (user_id, email_type);

comment on table public.trial_email_sent is 'Tracks trial lifecycle emails sent per user so each type is sent at most once.';
