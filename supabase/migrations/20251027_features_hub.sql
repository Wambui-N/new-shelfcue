-- Create the roadmap_items table
CREATE TABLE
  roadmap_items (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'not_started' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone ('utc'::TEXT, NOW()) NOT NULL
  );

-- Enable RLS
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow read access to roadmap_items" ON roadmap_items FOR
SELECT
  USING (TRUE);

-- Create the feature_requests table
CREATE TABLE
  feature_requests (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone ('utc'::TEXT, NOW()) NOT NULL
  );

-- Enable RLS
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own feature requests
CREATE POLICY "Allow users to insert their own feature requests" ON feature_requests FOR INSERT
WITH
  CHECK (auth.uid () = user_id);

-- Seed the roadmap_items table with initial data
INSERT INTO
  roadmap_items (title, status, description)
VALUES
  (
    'Email to users after filling form',
    'in_progress',
    'Send an automated email confirmation to users after they submit a form.'
  ),
  (
    'Follow-up reminding of meetings',
    'in_progress',
    'Automatically send reminder emails for scheduled meetings.'
  ),
  (
    'Conditional logic (show/hide fields)',
    'in_progress',
    'Show or hide form fields based on user input in other fields.'
  ),
  (
    'Multi-step forms',
    'in_progress',
    'Break down long forms into multiple, more manageable steps.'
  ),
  (
    'File uploads on forms',
    'in_progress',
    'Allow users to upload files through your forms.'
  ),
  (
    'Custom thank you pages',
    'in_progress',
    'Redirect users to a custom URL or display a custom message after form submission.'
  ),
  ('Form visit analytics', 'done', 'Track form views and conversion rates.'),
  (
    'Question drop-off analytics',
    'done',
    'See which questions cause users to abandon your form.'
  ),
  (
    'Framer plugin',
    'done',

'Embed and style your forms directly in Framer.'
  ),
  (
    'Template forms section',
    'not_started',
    'A gallery of pre-built form templates to get started quickly.'
  );
