# Trial Expiration System

This document explains how trial subscriptions are automatically expired and how forms are unpublished when trials end.

## Overview

When a user's 14-day trial period ends:
1. Their `user_subscriptions.status` is automatically changed from `trial` to `expired`
2. All of their `forms` with `status = 'published'` are automatically set back to `status = 'draft'`
3. The UI shows expired trial banners and blocks form publishing until they subscribe

## How It Works

### 1. Database Function

A Postgres function `expire_trial_subscriptions()` runs daily and:
- Finds all subscriptions where `status = 'trial'` AND `trial_end < now()`
- Updates those subscriptions to `status = 'expired'`
- Updates all published forms for those users to `status = 'draft'`

### 2. Scheduled Job

The function runs automatically every day at 00:05 UTC via pg_cron or Supabase Scheduled SQL.

### 3. Frontend Enforcement

The frontend already handles expired trials:

**Hook: `src/hooks/useSubscription.ts`**
```typescript
const isExpired =
  subscription?.status === "expired" ||
  (subscription?.status === "trial" && trialDaysRemaining === 0);
const hasAccess = isOnTrial || isActive;
```

**UI Components:**
- `src/components/subscriptions/TrialBanner.tsx` - Shows "Your trial has ended" banner
- `src/app/dashboard/billing/page.tsx` - Shows upgrade prompt
- `src/app/dashboard/forms/page.tsx` - Disables publishing for expired users

**Server Enforcement:**
- `src/app/api/forms/publish/route.ts` - Returns 403 if subscription expired
- `src/lib/subscriptionLimits.ts` - Checks `hasAccess` before allowing actions

## Implementation Steps

### 1. Create the Function and Schedule

Run the SQL in `supabase/migrations/expire_trial_subscriptions.sql`:

```bash
# Copy the SQL from the migration file and paste into Supabase SQL Editor
# Or if you have Supabase CLI:
supabase db execute -f supabase/migrations/expire_trial_subscriptions.sql
```

### 2. Verify Installation

Run these test queries in Supabase SQL Editor:

```sql
-- Check the function exists
select proname from pg_proc where proname = 'expire_trial_subscriptions';

-- Check the schedule (pg_cron only)
select * from cron.job where jobname = 'expire_trials_daily';

-- See which subscriptions would be affected right now
select id, user_id, status, trial_end 
from user_subscriptions 
where status = 'trial' and trial_end < now();
```

### 3. Test Manually

Create a test subscription with an expired trial_end and run the function:

```sql
-- Create a test user subscription with expired trial (replace user_id and plan_id)
insert into user_subscriptions (user_id, plan_id, status, trial_start, trial_end, current_period_start, current_period_end, billing_cycle)
values (
  'YOUR_TEST_USER_ID',
  (select id from subscription_plans where name = 'professional'),
  'trial',
  now() - interval '15 days',
  now() - interval '1 day',
  now() - interval '15 days',
  now() - interval '1 day',
  'monthly'
);

-- Run the function
select expire_trial_subscriptions();

-- Verify the subscription is now expired
select status from user_subscriptions where user_id = 'YOUR_TEST_USER_ID';

-- Clean up test data
delete from user_subscriptions where user_id = 'YOUR_TEST_USER_ID';
```

### 4. Monitor in Production

After deployment, monitor for the first week:

```sql
-- Check how many trials expired today
select count(*) 
from user_subscriptions 
where status = 'expired' 
and updated_at::date = current_date;

-- See recently expired users
select 
  us.user_id,
  p.email,
  us.trial_end::date as expired_on,
  count(f.id) as forms_count
from user_subscriptions us
join auth.users p on p.id = us.user_id
left join forms f on f.user_id = us.user_id
where us.status = 'expired'
and us.updated_at::date >= current_date - 7
group by us.user_id, p.email, us.trial_end
order by us.trial_end desc;
```

## User Experience

### When Trial is Active (Days 1-14)

- Forms can be created and published
- TrialBanner shows days remaining
- Full access to all features

### When Trial Expires (Day 15+)

**Automatic Changes:**
- `user_subscriptions.status` → `expired`
- All `forms` with `status = 'published'` → `status = 'draft'`

**What Users See:**
- 🚫 "Your trial has ended" banner on dashboard
- 🚫 Forms page shows "Subscribe to activate forms" message
- 🚫 Publish button disabled with "Subscribe to activate" tooltip
- ✅ Forms can still be created (just not published)
- ✅ Existing drafts are preserved

**What Users Must Do:**
- Click "Subscribe" / "Upgrade to paid"
- Complete payment via Paystack ($17/month)
- After payment, status → `active` and they can publish again

## Troubleshooting

### Schedule Not Running

**Check if pg_cron is enabled:**
```sql
select * from pg_extension where extname = 'pg_cron';
```

If not enabled, either:
1. Enable pg_cron extension in Supabase, OR
2. Use Supabase Dashboard → Database → Scheduled to create the job via UI

### Forms Not Unpublishing

**Check if function is actually running:**
```sql
-- This should show recent runs (pg_cron only)
select * from cron.job_run_details 
where jobid = (select jobid from cron.job where jobname = 'expire_trials_daily')
order by start_time desc
limit 10;
```

**Manually trigger the function:**
```sql
select expire_trial_subscriptions();
```

### Users Not Seeing Expired State

Check the frontend:
1. Open browser DevTools → Console
2. Look for "Trial auto-fixed" logs (the auto-fix should NOT create new trials for expired users)
3. Check `/api/subscriptions/current` response - should show `status: "expired"`

## Adding Email Notifications (Optional)

To notify users when their trial expires, you can:

1. Add an email notification function that runs after expiring trials
2. Use a service like Resend (already in the codebase at `src/lib/resend.ts`)
3. Schedule a separate job or extend `expire_trial_subscriptions()` to send emails

Example extension:
```sql
-- Extend the function to track who was expired for email notifications
create table if not exists expired_trial_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  expired_at timestamptz default now(),
  email_sent boolean default false,
  created_at timestamptz default now()
);

-- Then call an API endpoint from the function or a separate scheduled job
-- to send emails to users where email_sent = false
```

## Related Files

- `supabase/migrations/expire_trial_subscriptions.sql` - SQL function and schedule
- `src/hooks/useSubscription.ts` - Frontend subscription state logic
- `src/app/api/forms/publish/route.ts` - Server-side publish blocking
- `src/lib/subscriptionLimits.ts` - Subscription limit checks
- `src/components/subscriptions/TrialBanner.tsx` - Trial expiration UI
- `src/app/dashboard/billing/page.tsx` - Subscription management UI
- `src/app/dashboard/forms/page.tsx` - Forms list with publish restrictions
