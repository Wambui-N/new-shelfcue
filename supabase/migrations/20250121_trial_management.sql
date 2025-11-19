-- Migration: Trial Management and Data Consistency
-- This migration:
-- 1. Fixes subscriptions with missing trial dates
-- 2. Updates expired trials to "expired" status
-- 3. Adds indexes for better query performance
-- 4. Creates a function to automatically update expired trials

-- Step 1: Fix subscriptions that have current_period_start/end but missing trial_start/trial_end
-- If current_period_end is 14 days after current_period_start, it's likely a trial
UPDATE user_subscriptions
SET 
  trial_start = current_period_start,
  trial_end = current_period_end,
  status = CASE 
    WHEN status = 'inactive' AND current_period_end >= NOW() THEN 'trial'
    WHEN status = 'inactive' AND current_period_end < NOW() THEN 'expired'
    ELSE status
  END,
  updated_at = NOW()
WHERE 
  (trial_start IS NULL OR trial_end IS NULL)
  AND current_period_start IS NOT NULL
  AND current_period_end IS NOT NULL
  AND EXTRACT(EPOCH FROM (current_period_end - current_period_start)) / 86400 = 14; -- 14 days

-- Step 2: Update any existing subscriptions with expired trials
UPDATE user_subscriptions
SET 
  status = 'expired',
  updated_at = NOW()
WHERE 
  status = 'trial' 
  AND trial_end IS NOT NULL 
  AND trial_end < NOW();

-- Step 2a: Deactivate all published forms for users with expired trials
UPDATE forms
SET 
  status = 'draft',
  updated_at = NOW()
WHERE 
  status = 'published'
  AND user_id IN (
    SELECT user_id 
    FROM user_subscriptions 
    WHERE status = 'expired' 
       OR (status = 'trial' AND trial_end IS NOT NULL AND trial_end < NOW())
  );

-- Step 2: Add indexes for better query performance
-- Index on trial_end for faster expiration checks
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_trial_end 
ON user_subscriptions(trial_end) 
WHERE trial_end IS NOT NULL;

-- Index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status 
ON user_subscriptions(status);

-- Index on user_id and status for common queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status 
ON user_subscriptions(user_id, status);

-- Step 3: Create a function to automatically update expired trials and deactivate forms
-- This function can be called periodically (e.g., via a cron job or edge function)
CREATE OR REPLACE FUNCTION update_expired_trials()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
  deactivated_count INTEGER;
BEGIN
  -- Update expired subscriptions
  UPDATE user_subscriptions
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE 
    status = 'trial' 
    AND trial_end IS NOT NULL 
    AND trial_end < NOW();
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Deactivate all published forms for users with expired trials
  UPDATE forms
  SET 
    status = 'draft',
    updated_at = NOW()
  WHERE 
    status = 'published'
    AND user_id IN (
      SELECT user_id 
      FROM user_subscriptions 
      WHERE status = 'expired' 
         OR (status = 'trial' AND trial_end IS NOT NULL AND trial_end < NOW())
    );
  
  GET DIAGNOSTICS deactivated_count = ROW_COUNT;
  
  -- Return total count of subscriptions updated
  RETURN updated_count;
END;
$$;

-- Step 4: Add a comment explaining the function
COMMENT ON FUNCTION update_expired_trials() IS 
'Updates all trial subscriptions that have passed their trial_end date to expired status. Returns the number of subscriptions updated.';

