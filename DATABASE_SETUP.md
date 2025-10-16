# Database Setup Guide

## Issue: "Database error saving new user"

This error occurs when Supabase Auth tries to create a new user but encounters a database issue. Here's how to fix it:

## Solution 1: Check for Failing Triggers

Go to **Supabase Dashboard → SQL Editor** and run this to check for triggers:

```sql
-- List all triggers on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';
```

If you see any triggers, they might be failing. Common issues:
- Trigger tries to insert into a table that doesn't exist
- RLS policies blocking the insert
- Missing columns

## Solution 2: Disable Auto-Schema Creation (if present)

Check if you have any `handle_new_user()` function:

```sql
-- Check for user creation functions
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname LIKE '%user%' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

If you find a failing function, you can:

**Option A: Fix the function**
```sql
-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

**Option B: Create a working trigger for trial subscriptions**
```sql
-- Create function to initialize trial subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  professional_plan_id uuid;
BEGIN
  -- Get the professional plan ID (make sure this plan exists!)
  SELECT id INTO professional_plan_id
  FROM subscription_plans
  WHERE name = 'professional'
  LIMIT 1;

  -- Only create subscription if plan exists
  IF professional_plan_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (
      user_id,
      plan_id,
      status,
      trial_start,
      trial_end,
      current_period_start,
      current_period_end,
      billing_cycle,
      cancel_at_period_end
    ) VALUES (
      NEW.id,
      professional_plan_id,
      'inactive', -- Set to inactive until payment is added
      NULL,
      NULL,
      NOW(),
      NOW() + INTERVAL '14 days',
      'monthly',
      false
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create subscription for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Solution 3: Check RLS Policies

Make sure these tables have proper RLS policies:

```sql
-- Disable RLS on user_subscriptions for the trigger
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert
CREATE POLICY "Service role can insert subscriptions"
ON user_subscriptions
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow users to read their own subscription
CREATE POLICY "Users can read own subscription"
ON user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);
```

## Solution 4: Ensure Required Tables Exist

Run this to verify all required tables exist:

```sql
-- Check if required tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_subscriptions',
    'subscription_plans',
    'user_google_tokens',
    'forms',
    'submissions',
    'payment_transactions',
    'payment_authorizations',
    'invoices',
    'usage_tracking'
  )
ORDER BY table_name;
```

## Quick Fix (Temporary)

If you want to allow signups immediately while you debug:

```sql
-- Temporarily drop all triggers on auth.users to allow signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

Then fix the trigger logic and re-add it later.

## Verify Subscription Plans Exist

```sql
-- Check if professional plan exists
SELECT * FROM subscription_plans WHERE name = 'professional';

-- If it doesn't exist, create it:
INSERT INTO subscription_plans (
  name,
  display_name,
  description,
  price_monthly,
  price_yearly,
  features,
  limits
) VALUES (
  'professional',
  'Professional Plan',
  'Everything you need to grow your business',
  29,
  290,
  ARRAY[
    'Unlimited forms',
    'Unlimited submissions',
    'Google Sheets integration',
    'Google Calendar integration',
    'Custom branding',
    'Priority support',
    'Advanced analytics'
  ],
  jsonb_build_object(
    'forms', -1,
    'submissions_per_month', -1,
    'storage_mb', 10240,
    'team_members', 5,
    'analytics', 'advanced',
    'support', 'priority',
    'custom_branding', true,
    'api_access', true
  )
);
```

## After Fixing

Once you've resolved the database issue:
1. Try signing up again with Google
2. The OAuth flow should complete successfully
3. You'll be redirected to the billing page
4. Add payment details to activate your trial

## Need More Help?

Check Supabase logs:
1. Go to **Supabase Dashboard → Logs → Postgres Logs**
2. Look for errors around the time you tried to sign up
3. The detailed error message will tell you exactly what's failing

