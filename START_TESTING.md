# 🚀 Start Testing - Quick Guide

## Step 1: Run Database Migration (5 minutes)

1. Open Supabase Dashboard: https://app.supabase.com
2. Go to SQL Editor
3. Copy ALL contents of `supabase-migrations-v2.sql`
4. Paste and click "Run"
5. Wait for: `Migration completed successfully! ✅`

**Verify:**
```sql
-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```
Should see: `forms`, `submissions`, `form_views`, `sheet_connections`, `user_google_tokens`

---

## Step 2: Verify Environment (2 minutes)

Check `.env.local` has all variables:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=✓
NEXT_PUBLIC_SUPABASE_ANON_KEY=✓

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=✓
GOOGLE_CLIENT_SECRET=✓

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 3: Start Development Server (1 minute)

```bash
npm run dev
```

Wait for:
```
✓ Ready in X.Xs
- Local: http://localhost:3000
```

---

## Step 4: Quick Smoke Test (3 minutes)

### Test 1: Homepage
- [ ] Go to http://localhost:3000
- [ ] Page loads without errors
- [ ] Navigation works
- [ ] "Get Started" button works

### Test 2: Signup
- [ ] Go to /auth/signup
- [ ] Create account
- [ ] Should redirect to /auth/welcome
- [ ] Welcome page displays

### Test 3: Skip Google
- [ ] Click "Skip for Now"
- [ ] Should redirect to /dashboard
- [ ] Dashboard loads

### Test 4: Create Form
- [ ] Click "Create New Form"
- [ ] Form editor loads
- [ ] Add a text field
- [ ] See it in preview
- [ ] Wait 2 seconds
- [ ] Should see "✓ Saved"

**If all 4 tests pass → Ready for full testing!**

---

## Step 5: Test Google Integrations (10 minutes)

### A. Connect Google Account
1. Sign up with new email
2. On welcome page, click "Connect Google Account"
3. Grant permissions on Google
4. Should redirect to dashboard
5. Check database:
   ```sql
   SELECT * FROM user_google_tokens LIMIT 1;
   ```
   Should have access_token and refresh_token

### B. Create Google Sheet
1. Create form with 3 fields
2. Go to Settings tab
3. Click "Connect Google Sheet"
4. Enter name: "Test Responses"
5. Click "Create Sheet"
6. Should see "Connected" badge
7. Click "Open" - should open in Google Drive
8. Verify headers match form fields

### C. Test Sheet Sync
1. Publish the form
2. Copy form URL
3. Open in incognito
4. Fill and submit
5. Go to Google Sheet
6. Refresh (Ctrl+R)
7. Should see submission data

**If you see data in Google Sheet → Integration works! ✅**

---

## 🎯 Quick Test Checklist

**Core Features:**
- [ ] Signup works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can create form
- [ ] Can add fields
- [ ] Autosave works
- [ ] Can publish form
- [ ] Can submit form
- [ ] Submissions appear in dashboard

**Google Features:**
- [ ] Welcome page shows after signup
- [ ] Can connect Google account
- [ ] Tokens stored in database
- [ ] Can create Google Sheet
- [ ] Sheet appears in Drive
- [ ] Submissions sync to sheet
- [ ] Can connect calendar
- [ ] Calendar events create (if configured)

**Sharing Features:**
- [ ] Share dialog opens
- [ ] Can copy form URL
- [ ] Can copy embed code
- [ ] Social sharing works
- [ ] Public form loads
- [ ] Public form submits

---

## 🐛 Common Issues & Quick Fixes

### "Migration failed"
**Fix:** Check error message, may need to drop existing tables first

### "Google authentication required"
**Fix:** Connect Google account from welcome page or settings

### "Sheet not syncing"
**Fix:** 
1. Check server console for errors
2. Verify sheet exists in Google Drive
3. Check user_google_tokens table has valid tokens

### "Form not saving"
**Fix:**
1. Check browser console
2. Verify form has ID
3. Check RLS policies in Supabase

### "Dialog closes immediately"
**Fix:** Already fixed - all buttons have `type="button"`

---

## 📊 What to Check in Each Test

### Browser Console (F12)
Look for:
- ✅ No red errors
- ✅ "✓ Saved" messages
- ✅ "Fetched form" logs
- ✅ No 404 errors

### Server Terminal
Look for:
- ✅ "✓ Synced to Google Sheets"
- ✅ "✓ Created calendar event"
- ✅ "Form saved successfully"
- ✅ No error stack traces

### Supabase Dashboard
Check:
- ✅ Users table has entries
- ✅ Forms table has entries
- ✅ Submissions table has entries
- ✅ user_google_tokens has tokens
- ✅ sheet_connections has connections

### Google Drive
Check:
- ✅ Sheets created
- ✅ Headers correct
- ✅ Data syncing

### Google Calendar
Check:
- ✅ Events created
- ✅ Correct date/time
- ✅ Details populated

---

## ✅ Success Criteria

**Minimum Viable Test:**
1. ✅ Can sign up
2. ✅ Can create form
3. ✅ Can add fields
4. ✅ Form saves
5. ✅ Can publish
6. ✅ Can submit
7. ✅ Submission appears in dashboard

**Full Feature Test:**
1. ✅ All above +
2. ✅ Can connect Google
3. ✅ Can create Google Sheet
4. ✅ Submissions sync to sheet
5. ✅ Can share form
6. ✅ Can embed form
7. ✅ Mobile responsive

**Google Integration Test:**
1. ✅ OAuth flow works
2. ✅ Tokens stored
3. ✅ Sheets created
4. ✅ Data syncs
5. ✅ Calendar connects
6. ✅ Events create (if configured)

---

## 🎉 You're Ready!

**Current Status:**
- ✅ All code implemented
- ✅ Migration script ready
- ✅ Dependencies installed
- ✅ Documentation complete

**Next Steps:**
1. Run migration
2. Start dev server
3. Follow TEST_PLAN.md
4. Report any issues

**Let's start testing!** 🚀

---

## 📞 Testing Support

If you encounter issues:
1. Check browser console (F12)
2. Check server terminal
3. Check Supabase logs
4. Review error messages
5. Check relevant guide:
   - GOOGLE_INTEGRATIONS_GUIDE.md
   - FORM_EDITOR_GUIDE.md
   - SHARING_EMBEDDING_GUIDE.md
   - SETUP_INSTRUCTIONS.md

**Happy Testing!** ✨

