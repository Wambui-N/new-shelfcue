-- Migration: Form Branding and Image Storage
-- This migration:
-- 1. Adds header column to forms table
-- 2. Creates storage bucket for form assets (logos, background images)
-- 3. Sets up RLS policies for storage access

-- Step 1: Add header column to forms table
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS header TEXT;

-- Step 2: Create storage bucket for form assets
-- Note: This requires the storage extension to be enabled
-- The bucket will be created via Supabase dashboard or API, but we document it here

-- Step 3: Create storage policies for form-assets bucket
-- Users can only upload/read their own form assets
-- Note: These policies assume the bucket exists. Create it in Supabase dashboard first.

-- Policy: Users can upload files to their own folder
-- CREATE POLICY "Users can upload form assets"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'form-assets' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );

-- Policy: Users can read their own form assets
-- CREATE POLICY "Users can read their own form assets"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (
--   bucket_id = 'form-assets' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );

-- Policy: Users can update their own form assets
-- CREATE POLICY "Users can update their own form assets"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (
--   bucket_id = 'form-assets' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );

-- Policy: Users can delete their own form assets
-- CREATE POLICY "Users can delete their own form assets"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'form-assets' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );

-- Note: The actual bucket creation and policy setup should be done via:
-- 1. Supabase Dashboard → Storage → Create Bucket (name: form-assets, public: true)
-- 2. Or via Supabase Management API
-- 3. Then uncomment and run the policies above

