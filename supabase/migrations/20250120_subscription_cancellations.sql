-- Create subscription_cancellations table
CREATE TABLE IF NOT EXISTS subscription_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID,  -- Store subscription ID without foreign key constraint
  reason TEXT NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_reason CHECK (reason IN (
    'Too expensive',
    'Not using it enough',
    'Missing features I need',
    'Found a better alternative',
    'Technical issues',
    'Other'
  ))
);

-- Create index for faster lookups
CREATE INDEX idx_subscription_cancellations_user_id ON subscription_cancellations(user_id);
CREATE INDEX idx_subscription_cancellations_created_at ON subscription_cancellations(created_at);

-- Enable RLS
ALTER TABLE subscription_cancellations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own cancellation feedback"
  ON subscription_cancellations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own cancellation feedback"
  ON subscription_cancellations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin policy (for analytics)
CREATE POLICY "Service role can view all cancellation feedback"
  ON subscription_cancellations
  FOR SELECT
  TO service_role
  USING (true);

