-- Create user_google_tokens table for storing Google OAuth tokens
CREATE TABLE IF NOT EXISTS user_google_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at BIGINT NOT NULL, -- Store as Unix timestamp in seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_google_tokens_user_id ON user_google_tokens(user_id);

-- Enable Row Level Security
ALTER TABLE user_google_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can access own Google tokens" ON user_google_tokens;
DROP POLICY IF EXISTS "Service role can access all Google tokens" ON user_google_tokens;

-- Create RLS policy - users can only access their own tokens
CREATE POLICY "Users can access own Google tokens" ON user_google_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Create policy for service role (admin access)
CREATE POLICY "Service role can access all Google tokens" ON user_google_tokens
  FOR ALL USING (auth.role() = 'service_role');
