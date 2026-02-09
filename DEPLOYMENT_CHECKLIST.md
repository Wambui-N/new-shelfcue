# Deployment Checklist: Trial Expiration Feature

Complete these steps to deploy the automatic trial expiration feature to your Supabase project.

## ✅ Pre-deployment Checklist

- [ ] Have admin access to Supabase dashboard
- [ ] Have access to SQL Editor (Database → SQL Editor)
- [ ] Verify your project has these tables: `user_subscriptions`, `forms`
- [ ] (Optional) Have a staging/test Supabase project to test first

## 📋 Step-by-Step Deployment

### Step 1: Review the Changes

All implementation files are in your codebase:

```
✅ supabase/migrations/expire_trial_subscriptions.sql  (SQL function + schedule)
✅ docs/TRIAL_EXPIRATION.md                            (Full documentation)
✅ docs/SETUP_TRIAL_EXPIRATION.md                      (Quick setup guide)
✅ docs/SUPABASE.md                                    (Updated with trial info)
✅ README.md                                           (Updated with database setup)
```

### Step 2: Run the Migration in Supabase

**Option A: Using SQL Editor (Recommended)**

1. Open your Supabase Dashboard
2. Go to **Database → SQL Editor**
3. Click **New query**
4. Open `supabase/migrations/expire_trial_subscriptions.sql` in your code editor
5. Copy the **entire file contents**
6. Paste into the Supabase SQL Editor
7. Click **Run** (or press Ctrl/Cmd + Enter)
8. Verify you see: ✅ Success. No rows returned

**Option B: Using Supabase CLI (if installed)**

```bash
supabase db execute -f supabase/migrations/expire_trial_subscriptions.sql
```

### Step 3: Verify Installation

Run these queries in the SQL Editor:

**Check function exists:**
```sql
select proname from pg_proc where proname = 'expire_trial_subscriptions';
```
Expected: One row with `expire_trial_subscriptions`

**Check schedule exists (pg_cron):**
```sql
select * from cron.job where jobname = 'expire_trials_daily';
```
Expected: One row showing the scheduled job, OR an error if pg_cron is not enabled (see Option B below)

**Option B - If pg_cron is not available:**
1. Go to **Database → Scheduled** in Supabase Dashboard
2. Click **Create scheduled job**
3. Fill in:
   - Name: `expire_trials_daily`
   - Schedule: `5 0 * * *` (runs daily at 00:05 UTC)
   - SQL: `select public.expire_trial_subscriptions();`
4. Click **Create**

### Step 4: Test Manually (Staging/Test Environment)

**See which subscriptions would be affected:**
```sql
select 
  id, user_id, status, trial_end::date,
  case when trial_end < now() then 'WILL EXPIRE' else 'ACTIVE' end as status_check
from user_subscriptions 
where status = 'trial'
order by trial_end;
```

**Create a test subscription with past trial_end:**
```sql
-- Replace YOUR_TEST_USER_ID with a real test user ID
insert into user_subscriptions (
  user_id, 
  plan_id, 
  status, 
  trial_start, 
  trial_end,
  current_period_start,
  current_period_end,
  billing_cycle
)
values (
  'YOUR_TEST_USER_ID',
  (select id from subscription_plans where name = 'professional' limit 1),
  'trial',
  now() - interval '15 days',
  now() - interval '1 hour',  -- Expired 1 hour ago
  now() - interval '15 days',
  now() - interval '1 hour',
  'monthly'
);
```

**Run the function:**
```sql
select expire_trial_subscriptions();
```

**Verify the test subscription is now expired:**
```sql
select status from user_subscriptions where user_id = 'YOUR_TEST_USER_ID';
-- Expected: 'expired'
```

**Clean up test data:**
```sql
delete from user_subscriptions where user_id = 'YOUR_TEST_USER_ID';
```

### Step 5: Deploy to Production

If testing passed in staging:

1. Run the same migration in your **production** Supabase project
2. Verify the function and schedule were created (Step 3)
3. **Do NOT manually run the function yet** - let it run on schedule first

### Step 6: Monitor for First Week

Run these queries daily for the first week:

**Check if function ran today:**
```sql
-- pg_cron only
select 
  jobid, 
  runid, 
  status, 
  start_time, 
  end_time,
  return_message
from cron.job_run_details 
where jobid = (select jobid from cron.job where jobname = 'expire_trials_daily')
order by start_time desc
limit 5;
```

**Count expired today:**
```sql
select count(*) as expired_today
from user_subscriptions
where status = 'expired' 
and updated_at::date = current_date;
```

**See who expired recently:**
```sql
select 
  us.user_id,
  u.email,
  us.trial_end::date as trial_ended_on,
  us.updated_at::timestamp as expired_at,
  (select count(*) from forms where user_id = us.user_id) as total_forms,
  (select count(*) from forms where user_id = us.user_id and status = 'draft') as draft_forms
from user_subscriptions us
join auth.users u on u.id = us.user_id
where us.status = 'expired'
and us.updated_at >= now() - interval '7 days'
order by us.updated_at desc;
```

### Step 7: Verify Frontend Behavior

After deployment:

1. **Find a user with expired trial** (from the queries above)
2. **Log in as that user** (or have them check)
3. **Verify they see:**
   - 🚫 Red "Your Trial Has Expired" banner on dashboard
   - 🚫 Forms page shows "Trial Expired" badge
   - 🚫 "Subscribe Now to Continue" button
   - 🚫 Cannot activate/publish forms (button disabled)
   - 🚫 Forms are shown as "draft" status
   - ✅ Can still see their forms (just can't publish)

## 🔧 Troubleshooting

### Function runs but nothing happens

Check if you have any expired trials:
```sql
select * from user_subscriptions 
where status = 'trial' and trial_end < now();
```

If empty, there's nothing to expire yet. The function will work automatically when trials reach their end date.

### Schedule not running

**Check if pg_cron is enabled:**
```sql
select * from pg_extension where extname = 'pg_cron';
```

If not found, use Supabase Scheduled UI instead (Step 3, Option B).

### Need to disable/remove the schedule

**pg_cron:**
```sql
select cron.unschedule('expire_trials_daily');
```

**Supabase Scheduled UI:**
1. Database → Scheduled
2. Find `expire_trials_daily`
3. Click delete/trash icon

### Need to rollback

```sql
-- Drop the function
drop function if exists public.expire_trial_subscriptions();

-- Remove the schedule
select cron.unschedule('expire_trials_daily');
```

## 📊 Ongoing Monitoring

Add these to your monitoring dashboard:

**Daily expired count:**
```sql
select 
  date_trunc('day', updated_at)::date as date,
  count(*) as expired_count
from user_subscriptions
where status = 'expired'
group by date_trunc('day', updated_at)
order by date desc
limit 30;
```

**Forms unpublished count:**
```sql
select 
  count(*) as unpublished_today
from forms
where status = 'draft'
and updated_at::date = current_date
and user_id in (
  select user_id from user_subscriptions where status = 'expired'
);
```

## ✅ Deployment Complete!

Once all steps are done:

- [ ] Migration run in production
- [ ] Schedule verified (pg_cron or Supabase Scheduled)
- [ ] Test run completed successfully
- [ ] Frontend behavior verified
- [ ] Monitoring queries bookmarked
- [ ] Team notified of new feature

## 📚 Additional Resources

- **Full docs:** `docs/TRIAL_EXPIRATION.md`
- **Quick setup:** `docs/SETUP_TRIAL_EXPIRATION.md`
- **Supabase schema:** `docs/SUPABASE.md`
- **SQL migration:** `supabase/migrations/expire_trial_subscriptions.sql`

## 🚀 Next Steps (Optional)

Consider adding:

1. **Email notifications** when trials expire (using Resend)
2. **Grace period** (expire at day 15 instead of day 14)
3. **Metrics dashboard** showing trial-to-paid conversion
4. **Automated reminders** at day 10, 13, and 14 of trial
