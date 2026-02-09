# Quick Setup: Trial Expiration

Follow these steps to enable automatic trial expiration in your Supabase project.

## Prerequisites

- Access to your Supabase project dashboard
- SQL Editor access (Database → SQL Editor)
- Your project must have the tables: `user_subscriptions`, `forms`

## Step 1: Run the Migration

1. Open your Supabase Dashboard
2. Navigate to **Database → SQL Editor**
3. Click **New query**
4. Copy the entire contents of `supabase/migrations/expire_trial_subscriptions.sql`
5. Paste into the SQL Editor
6. Click **Run** or press `Ctrl/Cmd + Enter`

You should see: ✅ Success. No rows returned

## Step 2: Verify the Function Was Created

Run this query:

```sql
select proname, prosrc 
from pg_proc 
where proname = 'expire_trial_subscriptions';
```

Expected result: One row showing the function name and source code.

## Step 3: Verify the Schedule Was Created

### If using pg_cron:

```sql
select * from cron.job where jobname = 'expire_trials_daily';
```

Expected result: One row with:
- `jobname`: expire_trials_daily
- `schedule`: 5 0 * * *
- `active`: true

### If pg_cron is not available:

1. Go to **Database → Scheduled** in Supabase Dashboard
2. Click **Create scheduled job**
3. Fill in:
   - **Name:** `expire_trials_daily`
   - **Schedule (cron):** `5 0 * * *`
   - **SQL command:** `select public.expire_trial_subscriptions();`
4. Click **Create**

## Step 4: Test Manually (Optional but Recommended)

### See which subscriptions would be affected right now:

```sql
select 
  id, 
  user_id, 
  status, 
  trial_end::date as expires_on,
  case 
    when trial_end < now() then '❌ EXPIRED' 
    else '✅ ACTIVE' 
  end as current_state
from user_subscriptions 
where status = 'trial'
order by trial_end;
```

### Run the function manually:

```sql
select expire_trial_subscriptions();
```

### Check results:

```sql
-- See expired subscriptions
select id, user_id, status, trial_end::date, updated_at::timestamp
from user_subscriptions 
where status = 'expired'
order by updated_at desc
limit 10;

-- See forms that were unpublished
select 
  f.id, 
  f.title, 
  f.status, 
  f.updated_at::timestamp,
  us.status as subscription_status
from forms f
join user_subscriptions us on us.user_id = f.user_id
where us.status = 'expired'
order by f.updated_at desc
limit 10;
```

## Step 5: Monitor (First Week)

Run this daily for the first week to ensure it's working:

```sql
-- How many trials expired today?
select count(*) as expired_today
from user_subscriptions
where status = 'expired' 
and updated_at::date = current_date;

-- Who expired recently?
select 
  us.user_id,
  u.email,
  us.trial_end::date as expired_on,
  us.updated_at::timestamp as processed_at
from user_subscriptions us
join auth.users u on u.id = us.user_id
where us.status = 'expired'
and us.updated_at::date >= current_date - 7
order by us.updated_at desc;
```

## Troubleshooting

### "Function already exists" error

If you run the migration again, it will replace the existing function (that's what `create or replace` does). This is safe.

### "relation cron.job does not exist"

Your Supabase project doesn't have pg_cron enabled. Use the Supabase Scheduled UI instead (Step 3, option 2).

### Function runs but nothing changes

Check if you have any trial subscriptions with `trial_end < now()`:

```sql
select * from user_subscriptions 
where status = 'trial' and trial_end < now();
```

If the result is empty, there's nothing to expire yet. The function will automatically expire subscriptions as they reach their `trial_end` date.

### Need to unschedule the job

**pg_cron:**
```sql
select cron.unschedule('expire_trials_daily');
```

**Supabase Scheduled UI:**
1. Go to Database → Scheduled
2. Find `expire_trials_daily`
3. Click the trash icon

## Next Steps

- See [`TRIAL_EXPIRATION.md`](TRIAL_EXPIRATION.md) for full documentation
- Monitor the scheduled job for 1-2 weeks
- (Optional) Set up email notifications for expired trials

## Quick Reference

| Action | Query |
|--------|-------|
| Run function manually | `select expire_trial_subscriptions();` |
| Check schedule | `select * from cron.job where jobname = 'expire_trials_daily';` |
| See trials expiring soon | `select * from user_subscriptions where status = 'trial' and trial_end < now() + interval '3 days' order by trial_end;` |
| Count expired today | `select count(*) from user_subscriptions where status = 'expired' and updated_at::date = current_date;` |
