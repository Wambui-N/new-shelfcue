# Supabase Storage Setup Guide

## Form Assets Storage Bucket

To enable image uploads (logos and background images) for forms, you need to set up a Supabase storage bucket.

### Step 1: Create the Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `form-assets`
   - **Public bucket**: ✅ **Yes** (checked)
   - **File size limit**: 5 MB (or your preferred limit)
   - **Allowed MIME types**: `image/*` (or specific types like `image/png,image/jpeg,image/webp`)

### Step 2: Set Up Storage Policies

After creating the bucket, run the following SQL in the Supabase SQL Editor:

```sql
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
```

### Step 3: Verify Setup

After setting up the bucket and policies:

1. Try uploading a logo or background image in the form editor
2. Check that the image appears in the preview
3. Verify the image URL is accessible publicly

### File Structure

Files are stored with the following structure:
```
form-assets/
  └── {user_id}/
      ├── logo-{timestamp}.{ext}
      └── background-{timestamp}.{ext}
```

This ensures each user's files are isolated in their own folder, and the RLS policies can easily restrict access.

### Troubleshooting

**Error: "Storage bucket not configured"**
- Ensure the bucket name is exactly `form-assets`
- Verify the bucket is set to public
- Check that the storage policies are created

**Error: "Permission denied"**
- Verify the RLS policies are correctly set up
- Ensure the user is authenticated
- Check that the file path matches the policy pattern (`{user_id}/...`)

**Images not displaying**
- Verify the bucket is public
- Check the public URL is correctly generated
- Ensure CORS is enabled for your domain (if needed)

