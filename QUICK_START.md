# ShelfCue - Quick Start Guide

## 🚀 Get Your SaaS Running in 5 Minutes

### Step 1: Run Database Migration (REQUIRED)

**This is the most important step!** Your app won't work without it.

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run Migration Script**
   - Copy ALL contents of `supabase-migrations.sql`
   - Paste into SQL editor
   - Click "Run" (or Ctrl+Enter)
   - Wait for "Migration completed successfully!"

**What this does:**
- ✅ Creates `forms` table (if missing)
- ✅ Creates `submissions` table (if missing)
- ✅ Adds `theme` and `settings` columns
- ✅ Creates `form_views` table for analytics
- ✅ Sets up Row Level Security (RLS)
- ✅ Adds proper indexes
- ✅ Configures permissions

### Step 2: Verify Environment Variables

Check your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 3: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### Step 4: Test the Application

**1. Sign Up**
- Go to http://localhost:3000/auth/signup
- Create an account
- Verify email (check Supabase Auth)

**2. Create a Form**
- Go to Dashboard → Forms
- Click "Create New Form"
- Add some fields
- Customize theme
- Watch autosave work (✓ Saved indicator)

**3. Publish & Share**
- Click "Publish" button
- Click "Share" button
- Try copying the link
- Try the embed code

**4. Test Public Form**
- Open the form URL in incognito
- Fill out and submit
- Check Dashboard → Submissions

## ✅ Verification Checklist

- [ ] Migration script ran successfully
- [ ] No console errors on page load
- [ ] Can sign up/sign in
- [ ] Can create new form
- [ ] Can add fields to form
- [ ] Autosave works (see "✓ Saved")
- [ ] Can publish form
- [ ] Share dialog opens
- [ ] Can copy form URL
- [ ] Public form loads
- [ ] Can submit form
- [ ] Submission appears in dashboard

## 🐛 Common Issues

### "Error fetching form: {}"
**Cause:** Database columns missing
**Fix:** Run `supabase-migrations.sql`

### "submissions table does not exist"
**Cause:** Submissions table not created
**Fix:** Run `supabase-migrations.sql` (it creates the table)

### "Cannot save form"
**Cause:** RLS policies not set up
**Fix:** Run `supabase-migrations.sql` (it sets up RLS)

### "Form not found"
**Cause:** Form not published or doesn't exist
**Fix:** Publish the form first, then try accessing

### Autosave not working
**Cause:** Form ID missing or not logged in
**Fix:** Make sure you're logged in and form was created successfully

## 📊 Database Schema

After running migrations, you'll have:

**forms table:**
```sql
- id (UUID)
- user_id (UUID)
- title (TEXT)
- description (TEXT)
- fields (JSONB)
- status (TEXT)
- theme (JSONB) ← NEW
- settings (JSONB) ← NEW
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**submissions table:**
```sql
- id (UUID)
- form_id (UUID)
- data (JSONB)
- ip_address (TEXT)
- user_agent (TEXT)
- created_at (TIMESTAMPTZ)
```

**form_views table:**
```sql
- id (UUID)
- form_id (UUID)
- viewed_at (TIMESTAMPTZ)
- ip_address (TEXT)
- user_agent (TEXT)
- created_at (TIMESTAMPTZ)
```

## 🎯 Key Features

### Form Editor
- ✅ Visual drag-and-drop builder
- ✅ 9 field types
- ✅ Real-time preview
- ✅ Desktop/Mobile toggle
- ✅ Theme customization
- ✅ Autosave (2-second debounce)
- ✅ Clean breadcrumb navigation

### Sharing
- ✅ Direct link sharing
- ✅ Copy to clipboard
- ✅ Email sharing
- ✅ Social media (X, LinkedIn)

### Embedding
- ✅ HTML embed code
- ✅ React/Next.js code
- ✅ WordPress shortcode
- ✅ Live iframe preview
- ✅ Customization tips

### Dashboard
- ✅ Forms management
- ✅ Submissions tracking
- ✅ Analytics
- ✅ Account settings
- ✅ Billing
- ✅ Collapsible sidebar

### Design
- ✅ Minimal color palette
- ✅ Satoshi font family
- ✅ Dark/Light mode
- ✅ Smooth animations
- ✅ Fully responsive

## 📚 Documentation Files

- `SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `FORM_EDITOR_GUIDE.md` - Complete editor documentation
- `SHARING_EMBEDDING_GUIDE.md` - Sharing & embedding guide
- `FONT_SYSTEM_GUIDE.md` - Font system documentation
- `supabase-migrations.sql` - Database migration script

## 🎉 You're Ready!

Once the migration is complete, your SaaS is fully functional with:
- ✅ Authentication (Email + Google OAuth)
- ✅ Form builder with autosave
- ✅ Sharing & embedding
- ✅ Analytics dashboard
- ✅ Professional design
- ✅ Mobile responsive
- ✅ Enterprise features

**Next Steps:**
1. Run the migration
2. Create your first form
3. Share it with the world! 🚀

---

Need help? Check the browser console for detailed error messages.

