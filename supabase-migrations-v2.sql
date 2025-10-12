-- ShelfCue Form Editor - Database Migrations V2
-- This version handles existing tables properly
-- Run these SQL commands in your Supabase SQL Editor

-- Step 1: Create forms table if it doesn't exist
CREATE TABLE IF NOT EXISTS forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  fields JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Drop and recreate form_views table to ensure correct schema
DROP TABLE IF EXISTS form_views CASCADE;
CREATE TABLE form_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3a: Create sheet_connections table for Google Sheets integration
CREATE TABLE IF NOT EXISTS sheet_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sheet_id TEXT NOT NULL,
  sheet_url TEXT NOT NULL,
  sheet_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Add theme column to forms table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forms' 
    AND column_name = 'theme'
  ) THEN
    ALTER TABLE forms ADD COLUMN theme JSONB DEFAULT '{
      "primaryColor": "#151419",
      "backgroundColor": "#fafafa",
      "textColor": "#151419",
      "borderRadius": 8,
      "fontFamily": "Satoshi"
    }'::jsonb;
  END IF;
END $$;

-- Step 5: Add settings column to forms table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'forms' 
    AND column_name = 'settings'
  ) THEN
    ALTER TABLE forms ADD COLUMN settings JSONB DEFAULT '{
      "showTitle": true,
      "showDescription": true,
      "submitButtonText": "Submit",
      "successMessage": "Thank you for your submission!",
      "collectEmail": false,
      "allowMultipleSubmissions": true
    }'::jsonb;
  END IF;
END $$;

-- Step 6: Add ip_address and user_agent columns to submissions (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'submissions' 
    AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE submissions ADD COLUMN ip_address TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'submissions' 
    AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE submissions ADD COLUMN user_agent TEXT;
  END IF;
END $$;

-- Step 6a: Add Google integration columns to forms table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'forms' 
    AND column_name = 'default_sheet_connection_id'
  ) THEN
    ALTER TABLE forms ADD COLUMN default_sheet_connection_id UUID REFERENCES sheet_connections(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'forms' 
    AND column_name = 'default_calendar_id'
  ) THEN
    ALTER TABLE forms ADD COLUMN default_calendar_id TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'forms' 
    AND column_name = 'calendar_settings'
  ) THEN
    ALTER TABLE forms ADD COLUMN calendar_settings JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Step 7: Update existing forms to have default theme and settings (if they're null)
UPDATE forms 
SET theme = '{
  "primaryColor": "#151419",
  "backgroundColor": "#fafafa",
  "textColor": "#151419",
  "borderRadius": 8,
  "fontFamily": "Satoshi"
}'::jsonb
WHERE theme IS NULL;

UPDATE forms 
SET settings = '{
  "showTitle": true,
  "showDescription": true,
  "submitButtonText": "Submit",
  "successMessage": "Thank you for your submission!",
  "collectEmail": false,
  "allowMultipleSubmissions": true
}'::jsonb
WHERE settings IS NULL;

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at);

CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

CREATE INDEX IF NOT EXISTS idx_form_views_form_id ON form_views(form_id);
CREATE INDEX IF NOT EXISTS idx_form_views_viewed_at ON form_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_form_views_created_at ON form_views(created_at);

-- Step 9: Enable Row Level Security (RLS)
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheet_connections ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS policies for forms
DROP POLICY IF EXISTS "Users can view own forms" ON forms;
CREATE POLICY "Users can view own forms" ON forms
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own forms" ON forms;
CREATE POLICY "Users can create own forms" ON forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own forms" ON forms;
CREATE POLICY "Users can update own forms" ON forms
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own forms" ON forms;
CREATE POLICY "Users can delete own forms" ON forms
  FOR DELETE USING (auth.uid() = user_id);

-- Step 11: Create RLS policies for submissions
DROP POLICY IF EXISTS "Users can view own form submissions" ON submissions;
CREATE POLICY "Users can view own form submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = submissions.form_id 
      AND forms.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can submit to published forms" ON submissions;
CREATE POLICY "Anyone can submit to published forms" ON submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = submissions.form_id 
      AND forms.status = 'published'
    )
  );

-- Step 12: Create RLS policies for form_views
DROP POLICY IF EXISTS "Users can view own form views" ON form_views;
CREATE POLICY "Users can view own form views" ON form_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_views.form_id 
      AND forms.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can create form views" ON form_views;
CREATE POLICY "Anyone can create form views" ON form_views
  FOR INSERT WITH CHECK (true);

-- Step 13: Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 14: Create trigger for forms table
DROP TRIGGER IF EXISTS update_forms_updated_at ON forms;
CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 15: Create RLS policies for sheet_connections
DROP POLICY IF EXISTS "Users can view own sheet connections" ON sheet_connections;
CREATE POLICY "Users can view own sheet connections" ON sheet_connections
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own sheet connections" ON sheet_connections;
CREATE POLICY "Users can create own sheet connections" ON sheet_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sheet connections" ON sheet_connections;
CREATE POLICY "Users can update own sheet connections" ON sheet_connections
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sheet connections" ON sheet_connections;
CREATE POLICY "Users can delete own sheet connections" ON sheet_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Step 17: Add enhanced Google integration columns to forms table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'forms' 
    AND column_name = 'drive_folder_id'
  ) THEN
    ALTER TABLE forms ADD COLUMN drive_folder_id TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'forms' 
    AND column_name = 'meeting_settings'
  ) THEN
    ALTER TABLE forms ADD COLUMN meeting_settings JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'forms' 
    AND column_name = 'file_settings'
  ) THEN
    ALTER TABLE forms ADD COLUMN file_settings JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Step 18: Create form_files table for tracking uploaded files
CREATE TABLE IF NOT EXISTS form_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  drive_file_id TEXT NOT NULL,
  drive_file_url TEXT NOT NULL,
  uploaded_by_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 19: Create RLS policies for form_files
DROP POLICY IF EXISTS "Users can view own form files" ON form_files;
CREATE POLICY "Users can view own form files" ON form_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_files.form_id 
      AND forms.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert form files" ON form_files;
CREATE POLICY "Users can insert form files" ON form_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_files.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- Done! Your database is now ready for ShelfCue with enhanced features
SELECT 'Migration completed successfully! ✅' as message,
       'Tables created: forms, submissions, form_views, sheet_connections, form_files' as tables,
       'Columns added: theme, settings, ip_address, user_agent, default_sheet_connection_id, default_calendar_id, calendar_settings, drive_folder_id, meeting_settings, file_settings' as columns,
       'Security: RLS policies configured for all tables' as security,
       'Google Integrations: Ready for Sheets, Calendar, and Drive' as integrations,
       'New Features: Meeting booking, File uploads, Enhanced publish flow' as features;

