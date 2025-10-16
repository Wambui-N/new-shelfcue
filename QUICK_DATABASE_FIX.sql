-- QUICK DATABASE FIX FOR SHELFCUE
-- Run these in order in Supabase SQL Editor

-- ============================================
-- STEP 1: Fix the failing trigger function
-- ============================================

CREATE OR REPLACE FUNCTION public.initialize_trial_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  professional_plan_id uuid;
BEGIN
  -- Get the professional plan ID
  SELECT id INTO professional_plan_id
  FROM subscription_plans
  WHERE name = 'professional'
  LIMIT 1;

  -- If no plan found, log warning but don't fail user creation
  IF professional_plan_id IS NULL THEN
    RAISE WARNING 'Professional plan not found, user % created without subscription', NEW.id;
    RETURN NEW;
  END IF;

  -- Try to create subscription, catch any errors
  BEGIN
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
      'inactive', -- Inactive until payment added
      NULL,
      NULL,
      NOW(),
      NOW() + INTERVAL '14 days',
      'monthly',
      false
    );
    
    RAISE LOG 'Trial subscription initialized for user %', NEW.id;
  EXCEPTION
    WHEN unique_violation THEN
      RAISE WARNING 'Subscription already exists for user %', NEW.id;
    WHEN OTHERS THEN
      -- Log the error but don't block user creation
      RAISE WARNING 'Failed to create subscription for user %: % - %', NEW.id, SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
END;
$$;

-- ============================================
-- STEP 2: Ensure professional plan exists
-- ============================================

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
  jsonb_build_array(
    'Unlimited forms',
    'Unlimited submissions',
    'Google Sheets integration',
    'Google Calendar integration',
    'Custom branding',
    'Priority support'
  ),
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
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits;

-- ============================================
-- STEP 3: Fix RLS policies on user_subscriptions
-- ============================================

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can read own subscription" ON user_subscriptions;

-- Allow authenticated users to read their own subscription
CREATE POLICY "Users can read own subscription"
ON user_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow service role (triggers) to insert/update subscriptions
CREATE POLICY "Service role can manage subscriptions"
ON user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow postgres role to manage (for triggers running as SECURITY DEFINER)
GRANT INSERT, UPDATE, SELECT ON user_subscriptions TO postgres;
GRANT SELECT ON subscription_plans TO postgres;

-- ============================================
-- STEP 4: Verify the trigger is working
-- ============================================

-- Check trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name = 'create_trial_subscription_on_signup';

-- If the trigger doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'create_trial_subscription_on_signup'
  ) THEN
    CREATE TRIGGER create_trial_subscription_on_signup
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION initialize_trial_subscription();
  END IF;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete! Try signing up again.';
END $$;

