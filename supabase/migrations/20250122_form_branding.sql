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
-- See STORAGE_SETUP.md for detailed instructions.

-- IMPORTANT: Before running these policies, create the 'form-assets' bucket in Supabase Dashboard:
-- 1. Go to Storage → Buckets → New bucket
-- 2. Name: form-assets
-- 3. Public bucket: Yes
-- 4. File size limit: 5 MB
-- 5. Allowed MIME types: image/*

-- Drop existing policies if they exist (to allow re-running this migration)
DROP POLICY IF EXISTS "Users can upload form assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own form assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own form assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own form assets" ON storage.objects;

-- Policy: Users can upload files to their own folder
CREATE POLICY "Users can upload form assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'form-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own form assets
CREATE POLICY "Users can read their own form assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'form-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own form assets
CREATE POLICY "Users can update their own form assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'form-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own form assets
CREATE POLICY "Users can delete their own form assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'form-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

