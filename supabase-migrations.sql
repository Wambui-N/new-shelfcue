-- ShelfCue Form Editor - Database Migrations
-- Run these SQL commands in your Supabase SQL Editor

-- 0. Create tables if they don't exist
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

CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. Add theme column to forms table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'theme'
  ) THEN
    ALTER TABLE forms ADD COLUMN theme JSONB DEFAULT '{
      "primaryColor": "#151419",
      "backgroundColor": "#fafafa",
      "textColor": "#151419",
      "borderRadius": 8,
      "fontFamily": "Inter"
    }'::jsonb;
  END IF;
END $$;

-- 2. Add settings column to forms table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'settings'
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

-- 3. Update existing forms to have default theme and settings (if they're null)
UPDATE forms 
SET theme = '{
  "primaryColor": "#151419",
  "backgroundColor": "#fafafa",
  "textColor": "#151419",
  "borderRadius": 8,
  "fontFamily": "Inter"
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

-- 4. Create form_views table for analytics (if it doesn't exist)
CREATE TABLE IF NOT EXISTS form_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_views_form_id ON form_views(form_id);
CREATE INDEX IF NOT EXISTS idx_form_views_viewed_at ON form_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

-- 6. Add ip_address and user_agent columns to submissions (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submissions' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE submissions ADD COLUMN ip_address TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submissions' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE submissions ADD COLUMN user_agent TEXT;
  END IF;
END $$;

-- 7. Enable Row Level Security (RLS) if not already enabled
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_views ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for forms
-- Users can view their own forms
DROP POLICY IF EXISTS "Users can view own forms" ON forms;
CREATE POLICY "Users can view own forms" ON forms
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own forms
DROP POLICY IF EXISTS "Users can create own forms" ON forms;
CREATE POLICY "Users can create own forms" ON forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own forms
DROP POLICY IF EXISTS "Users can update own forms" ON forms;
CREATE POLICY "Users can update own forms" ON forms
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own forms
DROP POLICY IF EXISTS "Users can delete own forms" ON forms;
CREATE POLICY "Users can delete own forms" ON forms
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Create RLS policies for submissions
-- Users can view submissions for their own forms
DROP POLICY IF EXISTS "Users can view own form submissions" ON submissions;
CREATE POLICY "Users can view own form submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = submissions.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- Anyone can create submissions (for public forms)
DROP POLICY IF EXISTS "Anyone can submit to published forms" ON submissions;
CREATE POLICY "Anyone can submit to published forms" ON submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = submissions.form_id 
      AND forms.status = 'published'
    )
  );

-- 10. Create RLS policies for form_views
-- Users can view analytics for their own forms
DROP POLICY IF EXISTS "Users can view own form views" ON form_views;
CREATE POLICY "Users can view own form views" ON form_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_views.form_id 
      AND forms.user_id = auth.uid()
    )
  );

-- Anyone can create form views (for analytics)
DROP POLICY IF EXISTS "Anyone can create form views" ON form_views;
CREATE POLICY "Anyone can create form views" ON form_views
  FOR INSERT WITH CHECK (true);

-- Done! Your database is now ready for the ShelfCue Form Editor
SELECT 'Migration completed successfully!' as message;
