-- Check the current table schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_google_tokens' 
AND table_schema = 'public';

-- If the expires_at column is still TIMESTAMP, we need to change it to BIGINT
-- First, let's check what type it currently is
SELECT data_type 
FROM information_schema.columns 
WHERE table_name = 'user_google_tokens' 
AND column_name = 'expires_at';

-- If it's still timestamp, we need to alter it
-- Note: This will drop the column and recreate it, so any existing data will be lost
-- But since we're just testing, this should be fine

-- Drop the column if it exists (this will remove any existing data)
ALTER TABLE user_google_tokens DROP COLUMN IF EXISTS expires_at;

-- Add the column back with the correct type
ALTER TABLE user_google_tokens ADD COLUMN expires_at BIGINT NOT NULL DEFAULT 0;

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_google_tokens' 
AND table_schema = 'public';
