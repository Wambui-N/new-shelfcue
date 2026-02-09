-- Track when we sent the welcome email so we only send once per user.
alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz default null;

comment on column public.profiles.welcome_email_sent_at is 'Set when the welcome email has been sent (at most once per user).';
