# Form Editor Setup Instructions

## 🚨 Quick Fix for the Error

The error you're seeing is because your Supabase database is missing the `theme` and `settings` columns in the `forms` table. Here's how to fix it:

### Step 1: Run Database Migrations

1. **Go to your Supabase Dashboard**
   - Navigate to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration Script**
   - Copy the contents of `supabase-migrations.sql` 
   - Paste it into the SQL editor
   - Click "Run" or press Ctrl+Enter

This will:
- ✅ Add `theme` and `settings` columns to your `forms` table
- ✅ Set default values for existing forms
- ✅ Create the `form_views` table for analytics
- ✅ Add proper indexes for better performance
- ✅ Set up Row Level Security (RLS) policies
- ✅ Add `ip_address` and `user_agent` to submissions

### Step 2: Verify the Migration

After running the migration, verify it worked:

```sql
-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forms'
ORDER BY ordinal_position;
```

You should see:
- `theme` (jsonb)
- `settings` (jsonb)

### Step 3: Test the Form Editor

1. **Refresh your browser** (the dev server should still be running)
2. **Go to** http://localhost:3000/dashboard/forms
3. **Click "Create New Form"**
4. **Try adding some fields** and customizing the theme
5. **Click "Save Draft"** to test saving
6. **Click "Publish"** to publish the form

### Step 4: Test Form Submission

1. **Go to a published form** (click the eye icon)
2. **Copy the form URL**
3. **Open it in a new tab** or incognito window
4. **Fill out and submit the form**
5. **Check the dashboard** to see the submission

## 📋 Current Database Schema Required

Your `forms` table should have these columns:

```sql
id                 UUID (primary key)
user_id            UUID (references auth.users)
title              TEXT
description        TEXT
fields             JSONB
status             TEXT (draft/published)
theme              JSONB (new)
settings           JSONB (new)
created_at         TIMESTAMPTZ
updated_at         TIMESTAMPTZ
```

Your `submissions` table should have:

```sql
id                 UUID (primary key)
form_id            UUID (references forms)
data               JSONB
ip_address         TEXT (new)
user_agent         TEXT (new)
created_at         TIMESTAMPTZ
```

## 🔧 Alternative: Manual Column Addition

If you prefer to add columns manually:

```sql
-- Add theme column
ALTER TABLE forms ADD COLUMN theme JSONB DEFAULT '{
  "primaryColor": "#151419",
  "backgroundColor": "#fafafa",
  "textColor": "#151419",
  "borderRadius": 8,
  "fontFamily": "Inter"
}'::jsonb;

-- Add settings column
ALTER TABLE forms ADD COLUMN settings JSONB DEFAULT '{
  "showTitle": true,
  "showDescription": true,
  "submitButtonText": "Submit",
  "successMessage": "Thank you for your submission!",
  "collectEmail": false,
  "allowMultipleSubmissions": true
}'::jsonb;
```

## 🐛 Troubleshooting

### Error: "column does not exist"
- Run the migration script above
- Make sure you're connected to the correct database

### Error: "permission denied"
- Check your RLS policies
- Make sure you're logged in as the correct user

### Forms not loading
- Check the browser console for errors
- Verify the Supabase URL and anon key in `.env.local`
- Make sure the user is authenticated

### Can't save forms
- Check if the `theme` and `settings` columns exist
- Verify the form data structure matches the schema
- Check browser console for detailed error messages

## 📊 Monitoring

After setup, you can monitor:

**Forms Table:**
```sql
SELECT id, title, status, created_at 
FROM forms 
ORDER BY created_at DESC;
```

**Submissions:**
```sql
SELECT s.id, s.created_at, f.title as form_name
FROM submissions s
JOIN forms f ON s.form_id = f.id
ORDER BY s.created_at DESC
LIMIT 10;
```

**Form Views:**
```sql
SELECT f.title, COUNT(*) as views
FROM form_views fv
JOIN forms f ON fv.form_id = f.id
GROUP BY f.id, f.title
ORDER BY views DESC;
```

## ✅ Checklist

- [ ] Run `supabase-migrations.sql` in Supabase SQL Editor
- [ ] Verify columns were added successfully
- [ ] Refresh browser on http://localhost:3000
- [ ] Test creating a new form
- [ ] Test editing an existing form
- [ ] Test publishing a form
- [ ] Test submitting to a public form
- [ ] Check submissions in dashboard

## 🎉 Success!

Once you've completed these steps, your form editor should be fully functional! You can:
- ✅ Create beautiful forms with drag-and-drop
- ✅ Customize themes and styling
- ✅ Publish forms and get public URLs
- ✅ Embed forms on any website
- ✅ Collect and manage submissions
- ✅ Track analytics and performance

## 📞 Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Check the terminal where the dev server is running
3. Verify your `.env.local` has the correct Supabase credentials
4. Make sure your Supabase project is active and not paused

---

Happy form building! 🚀
