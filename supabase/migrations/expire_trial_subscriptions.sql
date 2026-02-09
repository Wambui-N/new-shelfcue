-- Migration: Auto-expire trial subscriptions and unpublish forms
-- Purpose: Automatically mark trial subscriptions as expired when trial_end passes,
--          and set all published forms for those users back to draft status.
-- Run this in Supabase SQL Editor to create the function and schedule.

-- ============================================================================
-- STEP 1: Create the function
-- ============================================================================

create or replace function public.expire_trial_subscriptions()
returns void language plpgsql
security definer
set search_path = public
as $$
begin
  -- Update trial subscriptions that have passed their end date
  with expired_subs as (
    update public.user_subscriptions
    set 
      status = 'expired',
      updated_at = now()
    where 
      status = 'trial' 
      and trial_end < now()
    returning user_id
  )
  -- Set published forms to draft for affected users
  update public.forms
  set 
    status = 'draft',
    updated_at = now()
  where 
    user_id in (select user_id from expired_subs) 
    and status = 'published';
end;
$$;

-- Grant execute permission (adjust based on your RLS setup)
grant execute on function public.expire_trial_subscriptions() to service_role;

-- ============================================================================
-- STEP 2: Schedule the function (do this in Supabase Dashboard, not here)
-- ============================================================================
--
-- pg_cron is not enabled by default on Supabase. Use the built-in scheduler:
--
-- 1. Go to Supabase Dashboard → Database → Cron Jobs (or "Scheduled")
-- 2. Click "Create a new cron job"
-- 3. Name: expire_trials_daily
-- 4. Schedule: 5 0 * * *  (daily at 00:05 UTC)
-- 5. Command: select public.expire_trial_subscriptions();
-- 6. Save
--
-- (Optional) If your project has pg_cron enabled, you can run this in SQL Editor:
--   select cron.schedule('expire_trials_daily', '5 0 * * *', $$select public.expire_trial_subscriptions();$$);

-- ============================================================================
-- TESTING (run these in separate queries after the migration succeeds)
-- ============================================================================
--
-- 1) Check current trial subscriptions:
--    select id, user_id, status, trial_end::date from public.user_subscriptions where status = 'trial' order by trial_end;
--
-- 2) Manually run the function:
--    select public.expire_trial_subscriptions();
--
-- 3) Verify expired subscriptions:
--    select id, user_id, status, updated_at from public.user_subscriptions where status = 'expired' limit 20;
--
-- 4) Verify forms set to draft:
--    select f.id, f.title, f.status from public.forms f join public.user_subscriptions us on us.user_id = f.user_id where us.status = 'expired' limit 20;
--

-- ============================================================================
-- ROLLBACK (run only if you need to remove the function)
-- ============================================================================
-- drop function if exists public.expire_trial_subscriptions();

-- ============================================================================
-- MONITORING (run these manually when needed)
-- ============================================================================
-- Count expired by date:
--   select date_trunc('day', updated_at)::date, count(*) from public.user_subscriptions where status = 'expired' group by 1 order by 1 desc limit 30;
-- Recently expired users:
--   select us.user_id, p.email, us.trial_end::date from public.user_subscriptions us join auth.users p on p.id = us.user_id where us.status = 'expired' order by us.updated_at desc limit 20;
