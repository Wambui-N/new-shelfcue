-- ============================================
-- Subscription and Payment Schema for Paystack
-- ============================================

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- 'free', 'professional'
  display_name TEXT NOT NULL, -- 'Free', 'Professional'
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10, 2),
  paystack_plan_code TEXT, -- Plan code from Paystack dashboard
  features JSONB DEFAULT '[]'::JSONB,
  limits JSONB DEFAULT '{
    "forms": 3,
    "submissions_per_month": 100,
    "team_members": 1,
    "storage_mb": 100
  }'::JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plan (Professional only with 14-day trial)
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits) VALUES
('professional', 'Professional', 'Full access to all features with 14-day trial', 29, 290,
  '["Unlimited forms", "Unlimited leads/month", "Google Sheets integration", "Google Calendar integration", "Meeting booking", "Advanced analytics", "Priority support", "Custom branding", "Email notifications"]'::JSONB,
  '{"forms": -1, "submissions_per_month": -1, "team_members": 10, "storage_mb": 10000, "analytics": "advanced", "support": "priority", "custom_branding": true, "api_access": true}'::JSONB
)
ON CONFLICT (name) DO NOTHING;

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  paystack_customer_code TEXT, -- Customer code from Paystack
  paystack_subscription_code TEXT, -- Subscription code from Paystack
  paystack_email_token TEXT, -- Email token for subscription management
  status TEXT NOT NULL DEFAULT 'trial', -- 'trial', 'active', 'cancelled', 'expired'
  billing_cycle TEXT DEFAULT 'monthly', -- 'monthly', 'yearly'
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One active subscription per user
);

-- Create payment_authorizations table (stores card authorization codes)
CREATE TABLE IF NOT EXISTS payment_authorizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paystack_authorization_code TEXT NOT NULL UNIQUE,
  paystack_customer_code TEXT,
  card_type TEXT, -- 'visa', 'mastercard', etc.
  card_last4 TEXT,
  card_exp_month TEXT,
  card_exp_year TEXT,
  bank TEXT,
  channel TEXT, -- 'card', 'bank', etc.
  is_reusable BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_authorizations_user_id ON payment_authorizations(user_id);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  paystack_invoice_code TEXT,
  invoice_number TEXT UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT NOT NULL, -- 'pending', 'paid', 'failed'
  description TEXT,
  paid_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);

-- Create payment_transactions table (for tracking all payments)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  paystack_reference TEXT UNIQUE NOT NULL,
  paystack_transaction_id BIGINT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT NOT NULL, -- 'pending', 'success', 'failed', 'abandoned'
  payment_method TEXT, -- 'card', 'bank_transfer', etc.
  authorization_code TEXT,
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  gateway_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(paystack_reference);

-- Create usage_tracking table (for monitoring subscription limits)
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  forms_count INT DEFAULT 0,
  submissions_count INT DEFAULT 0,
  storage_used_mb DECIMAL(10, 2) DEFAULT 0,
  api_calls_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start) -- One usage record per user per period
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role can manage subscription plans" ON subscription_plans;
CREATE POLICY "Service role can manage subscription plans" ON subscription_plans
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for user_subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON user_subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for payment_authorizations
DROP POLICY IF EXISTS "Users can view own payment methods" ON payment_authorizations;
CREATE POLICY "Users can view own payment methods" ON payment_authorizations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own payment methods" ON payment_authorizations;
CREATE POLICY "Users can delete own payment methods" ON payment_authorizations
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage payment authorizations" ON payment_authorizations;
CREATE POLICY "Service role can manage payment authorizations" ON payment_authorizations
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage invoices" ON invoices;
CREATE POLICY "Service role can manage invoices" ON invoices
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for payment_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions;
CREATE POLICY "Users can view own transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage transactions" ON payment_transactions;
CREATE POLICY "Service role can manage transactions" ON payment_transactions
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for usage_tracking
DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage usage" ON usage_tracking;
CREATE POLICY "Service role can manage usage" ON usage_tracking
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Helper Functions
-- ============================================

-- Function to get user's current subscription with plan details
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_name TEXT,
  plan_display_name TEXT,
  price_monthly DECIMAL,
  status TEXT,
  billing_cycle TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN,
  limits JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    sp.name,
    sp.display_name,
    sp.price_monthly,
    us.status,
    us.billing_cycle,
    us.current_period_end,
    us.cancel_at_period_end,
    sp.limits
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has reached a specific limit
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_limit_type TEXT -- 'forms', 'submissions_per_month', etc.
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_usage INT;
  v_limit INT;
  v_plan_limits JSONB;
  v_subscription_status TEXT;
  v_trial_end TIMESTAMPTZ;
BEGIN
  -- Get user's subscription status and limits
  SELECT us.status, us.trial_end, sp.limits 
  INTO v_subscription_status, v_trial_end, v_plan_limits
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id;
  
  -- If no subscription found, deny access
  IF v_plan_limits IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if trial has expired
  IF v_subscription_status = 'trial' AND v_trial_end < NOW() THEN
    RETURN false; -- Trial expired, no access
  END IF;
  
  -- Check if subscription is expired or cancelled
  IF v_subscription_status IN ('expired', 'cancelled') THEN
    RETURN false;
  END IF;
  
  -- Get the limit value (-1 means unlimited)
  v_limit := (v_plan_limits->>p_limit_type)::INT;
  
  IF v_limit = -1 THEN
    RETURN true; -- Unlimited
  END IF;
  
  -- Get current usage based on limit type
  IF p_limit_type = 'forms' THEN
    SELECT COUNT(*) INTO v_current_usage
    FROM forms
    WHERE user_id = p_user_id;
  ELSIF p_limit_type = 'submissions_per_month' THEN
    SELECT COALESCE(submissions_count, 0) INTO v_current_usage
    FROM usage_tracking
    WHERE user_id = p_user_id
      AND period_start <= NOW()
      AND period_end >= NOW()
    ORDER BY period_start DESC
    LIMIT 1;
  END IF;
  
  RETURN v_current_usage < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize trial subscription for new users
CREATE OR REPLACE FUNCTION initialize_trial_subscription()
RETURNS TRIGGER AS $$
DECLARE
  v_professional_plan_id UUID;
  v_trial_end TIMESTAMPTZ;
BEGIN
  -- Get professional plan ID
  SELECT id INTO v_professional_plan_id
  FROM subscription_plans
  WHERE name = 'professional'
  LIMIT 1;
  
  -- Calculate trial end date (14 days from now)
  v_trial_end := NOW() + INTERVAL '14 days';
  
  -- Create trial subscription for new user
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    billing_cycle,
    trial_start,
    trial_end,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    v_professional_plan_id,
    'trial',
    'monthly',
    NOW(),
    v_trial_end,
    NOW(),
    v_trial_end
  );
  
  -- Initialize usage tracking for current period
  INSERT INTO usage_tracking (
    user_id,
    period_start,
    period_end
  ) VALUES (
    NEW.id,
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create trial subscription for new users
DROP TRIGGER IF EXISTS create_trial_subscription_on_signup ON auth.users;
CREATE TRIGGER create_trial_subscription_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_trial_subscription();

-- ============================================
-- Update timestamp triggers
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_authorizations_updated_at ON payment_authorizations;
CREATE TRIGGER update_payment_authorizations_updated_at
  BEFORE UPDATE ON payment_authorizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

