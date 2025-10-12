# ShelfCue - Complete Testing Plan

## 🎯 Testing Overview

This document provides a comprehensive testing plan for all ShelfCue features, with special focus on Google integrations.

---

## ✅ Pre-Testing Setup

### 1. Database Migration
- [ ] Run `supabase-migrations-v2.sql` in Supabase SQL Editor
- [ ] Verify success message appears
- [ ] Check tables exist:
  ```sql
  SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  ```
  Should see: `forms`, `submissions`, `form_views`, `sheet_connections`, `user_google_tokens`

### 2. Environment Variables
Check `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Google Cloud Console Setup
- [ ] Go to https://console.cloud.google.com
- [ ] Create/select project
- [ ] Enable APIs:
  - [ ] Google Sheets API
  - [ ] Google Calendar API
  - [ ] Google Drive API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`

### 4. Dependencies
- [ ] Run `npm install` to ensure all packages installed
- [ ] Verify `googleapis@^162.0.0` in package.json
- [ ] Verify `zustand@^5.0.8` in package.json

### 5. Development Server
- [ ] Run `npm run dev`
- [ ] Server starts on http://localhost:3000
- [ ] No console errors on startup

---

## 🧪 Test Suite

### TEST 1: Authentication Flow ⭐

**Purpose:** Verify user signup, signin, and Google OAuth

**Steps:**
1. Navigate to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Enter email: `test@example.com`
4. Enter password: `Test123456!`
5. Click "Create account"
6. Should redirect to `/auth/welcome`

**Expected:**
- ✅ Signup form works
- ✅ No errors in console
- ✅ User created in Supabase Auth
- ✅ Redirects to welcome page

**Verify in Supabase:**
```sql
SELECT id, email, created_at FROM auth.users 
WHERE email = 'test@example.com';
```

---

### TEST 2: Google Connection Prompt ⭐⭐

**Purpose:** Test the welcome page and Google OAuth initiation

**Steps:**
1. On welcome page, verify you see:
   - "Connect Google Workspace" title
   - 3 benefit cards (Sheets, Calendar, Security)
   - Permissions list
   - "Connect Google Account" button
   - "Skip for Now" button

2. **Test Skip:**
   - Click "Skip for Now"
   - Should redirect to `/dashboard`
   - Dashboard should load successfully

3. **Test Connect (with new account):**
   - Sign up with different email
   - On welcome page, click "Connect Google Account"
   - Should redirect to Google OAuth consent screen
   - Google should show:
     - App name
     - Permissions requested
     - "Allow" button
   - Click "Allow"
   - Should redirect back to dashboard

**Expected:**
- ✅ Welcome page displays correctly
- ✅ Skip works
- ✅ Connect redirects to Google
- ✅ OAuth consent screen shows correct permissions
- ✅ Callback redirects to dashboard
- ✅ Tokens stored in database

**Verify in Database:**
```sql
SELECT 
  user_id,
  access_token IS NOT NULL as has_access,
  refresh_token IS NOT NULL as has_refresh,
  expires_at,
  created_at
FROM user_google_tokens
WHERE user_id = 'your_user_id';
```

---

### TEST 3: Form Creation ⭐

**Purpose:** Verify form builder works correctly

**Steps:**
1. In dashboard, click "Create New Form"
2. Should see form editor with:
   - Breadcrumb: "← Forms > Untitled Form"
   - Preview on left
   - Fields/Settings/Theme tabs on right
   - Desktop/Mobile toggle

3. **Add Fields:**
   - Click "Text Input" button
   - Field should appear in preview
   - Edit label to "Full Name"
   - Add "Email" field
   - Add "Message" (Textarea) field

4. **Test Autosave:**
   - Make changes
   - Wait 2 seconds
   - Should see "Saving..." then "✓ Saved"

5. **Customize Theme:**
   - Go to Theme tab
   - Change primary color
   - Preview should update immediately
   - Change border radius
   - Preview should update

**Expected:**
- ✅ Form editor loads
- ✅ Can add fields
- ✅ Preview updates in real-time
- ✅ Autosave works
- ✅ Theme changes apply
- ✅ No console errors

---

### TEST 4: Google Sheets Integration ⭐⭐⭐

**Purpose:** Test complete Sheets integration flow

**Steps:**

**4A. Connect Google Sheets:**
1. In form editor, go to "Settings" tab
2. Scroll to "Google Integrations"
3. Should see "Google Sheets" card
4. If not connected, should see "Connect Google" button first
5. Click "Connect Google Sheet"
6. Dialog opens with "Sheet Name" input
7. Enter: "Test Form Responses"
8. Click "Create Sheet"
9. Should see loading spinner
10. Should see success and "Connected" badge
11. Click "Open" icon
12. Should open Google Sheet in new tab

**Expected:**
- ✅ Integration panel displays
- ✅ Dialog opens
- ✅ Sheet creates successfully
- ✅ Opens in Google Drive
- ✅ Headers: Timestamp, Full Name, Email, Message

**4B. Test Sheet Sync:**
1. Save and publish the form
2. Click "Share" → Copy form URL
3. Open URL in incognito window
4. Fill out form:
   - Full Name: "John Doe"
   - Email: "john@test.com"
   - Message: "Test message"
5. Submit form
6. Go back to Google Sheet
7. Refresh sheet (Ctrl+R)
8. Should see new row with submission data

**Expected:**
- ✅ Submission saves to database
- ✅ Data appears in Google Sheet
- ✅ Timestamp is correct
- ✅ All fields in correct columns
- ✅ Server console shows: "✓ Synced to Google Sheets"

**Verify in Database:**
```sql
SELECT 
  s.id,
  s.data,
  s.created_at,
  f.title,
  sc.sheet_name
FROM submissions s
JOIN forms f ON s.form_id = f.id
LEFT JOIN sheet_connections sc ON f.default_sheet_connection_id = sc.id
WHERE f.user_id = 'your_user_id'
ORDER BY s.created_at DESC
LIMIT 5;
```

**4C. Test Multiple Submissions:**
1. Submit form 3 more times with different data
2. Check Google Sheet
3. Should see 4 rows total
4. All timestamps should be different
5. Data should match submissions

**Expected:**
- ✅ All submissions sync
- ✅ No duplicate rows
- ✅ Correct order (newest at bottom)

---

### TEST 5: Google Calendar Integration ⭐⭐⭐

**Purpose:** Test calendar event creation

**Steps:**

**5A. Connect Calendar:**
1. In form editor → Settings tab
2. Scroll to "Google Integrations"
3. Click "Connect Google Calendar"
4. Dialog should open
5. Should see list of your calendars
6. Select "Primary" calendar
7. Dialog closes
8. Should see "Connected" badge

**Expected:**
- ✅ Calendar list loads
- ✅ Shows calendar names
- ✅ Can select calendar
- ✅ Connection saves

**5B. Create Form with Date/Time:**
1. Create new form
2. Add fields:
   - Name (text)
   - Email (email)
   - Event Date (date)
   - Event Time (text) - placeholder: "14:00"
3. Connect Google Calendar
4. Publish form

**5C. Test Event Creation:**
1. Submit form with:
   - Name: "Jane Smith"
   - Email: "jane@test.com"
   - Event Date: Tomorrow's date
   - Event Time: "15:00"
2. Check Google Calendar
3. Navigate to tomorrow
4. Should see event created

**Expected:**
- ✅ Event appears in calendar
- ✅ Correct date and time
- ✅ Event title includes name
- ✅ Server console shows: "✓ Created calendar event"

**Note:** Calendar event creation requires proper field mapping in calendar_settings. For basic testing, it may not create events without configuration.

---

### TEST 6: Share & Embed ⭐⭐

**Purpose:** Test form sharing and embedding

**Steps:**

**6A. Share Dialog:**
1. View any published form
2. Click "Share & Embed" button
3. Dialog should open and stay open
4. Should see 3 tabs: Link, Embed, Social

**6B. Test Link Tab:**
1. Go to "Link" tab
2. Should see form URL
3. Click "Copy" button
4. Should see "Copied!" feedback
5. Click "Open" button
6. Should open form in new tab

**6C. Test Embed Tab:**
1. Go to "Embed" tab
2. Should see 3 code snippets:
   - HTML
   - React/Next.js
   - WordPress
3. Click copy button on HTML code
4. Should copy to clipboard
5. Should see checkmark feedback

**6D. Test Social Tab:**
1. Go to "Social" tab
2. Click "Share via Email"
3. Should open mail client
4. Click "Share on X"
5. Should open Twitter
6. Click "Share on LinkedIn"
7. Should open LinkedIn

**Expected:**
- ✅ Dialog stays open
- ✅ All tabs work
- ✅ Copy functions work
- ✅ Social shares open correctly
- ✅ No console errors

---

### TEST 7: Dashboard Features ⭐

**Purpose:** Verify dashboard displays data correctly

**Steps:**

**7A. Main Dashboard:**
1. Go to `/dashboard`
2. Should see:
   - Welcome banner with your name
   - 3 stat cards (Active Forms, Leads This Week, Last Lead)
   - Recent Activity section
   - Your Forms section

**7B. Forms Page:**
1. Go to `/dashboard/forms`
2. Should see list of your forms
3. Test grid/table view toggle
4. Test search functionality
5. Test status filter

**7C. Submissions Page:**
1. Go to `/dashboard/submissions`
2. Should see all submissions
3. Test search by name/email
4. Test form filter
5. Click "View Details" on a submission

**7D. Analytics Page:**
1. Go to `/dashboard/analytics`
2. Should see metrics:
   - Total Forms
   - Form Views
   - Submissions
   - Conversion Rate
3. Should see form performance breakdown

**Expected:**
- ✅ All pages load
- ✅ Data displays correctly
- ✅ Filters work
- ✅ Search works
- ✅ Real data from Supabase

---

### TEST 8: Mobile Responsiveness ⭐

**Purpose:** Verify mobile experience

**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. Test:
   - [ ] Landing page
   - [ ] Navigation menu
   - [ ] Signup/Signin forms
   - [ ] Dashboard sidebar
   - [ ] Form editor
   - [ ] Form submission

**Expected:**
- ✅ All pages responsive
- ✅ Navigation works on mobile
- ✅ Forms usable on mobile
- ✅ No horizontal scroll
- ✅ Touch targets adequate

---

### TEST 9: Error Handling ⭐⭐

**Purpose:** Verify graceful error handling

**Test Scenarios:**

**9A. Google Not Connected:**
1. Create form without connecting Google
2. Try to connect sheet
3. Should see "Connect Google Account" prompt

**9B. Invalid Form Submission:**
1. Submit form with missing required fields
2. Should see validation errors
3. Should not save to database

**9C. Network Error:**
1. Disconnect internet
2. Try to save form
3. Should see error message
4. Reconnect internet
5. Click "Retry"
6. Should save successfully

**9D. Deleted Sheet:**
1. Connect form to sheet
2. Delete sheet from Google Drive
3. Submit form
4. Submission should still save
5. Check console - should see sheet sync error
6. User should not see error

**Expected:**
- ✅ Errors handled gracefully
- ✅ User sees helpful messages
- ✅ Submissions never fail completely
- ✅ Background tasks fail silently

---

### TEST 10: Performance ⭐

**Purpose:** Verify app performance

**Metrics to Check:**

**Page Load Times:**
- [ ] Landing page: < 2s
- [ ] Dashboard: < 3s
- [ ] Form editor: < 3s
- [ ] Public form: < 1s

**Autosave Performance:**
- [ ] Saves within 2s of last change
- [ ] Doesn't block UI
- [ ] Visual feedback immediate

**Google API Calls:**
- [ ] Sheet creation: < 5s
- [ ] Calendar list: < 3s
- [ ] Submission sync: < 2s (background)

**Database Queries:**
- [ ] Forms list: < 500ms
- [ ] Submissions list: < 500ms
- [ ] Analytics: < 1s

---

## 🔍 Detailed Test Cases

### Test Case 1: Complete User Journey

**Scenario:** New user signs up and creates their first form with Google Sheets

**Steps:**
1. ✅ Visit homepage
2. ✅ Click "Get Started"
3. ✅ Sign up with email/password
4. ✅ See welcome page
5. ✅ Connect Google account
6. ✅ Grant permissions
7. ✅ Land on dashboard
8. ✅ Click "Create New Form"
9. ✅ Add 3 fields
10. ✅ Go to Settings → Connect Google Sheet
11. ✅ Create new sheet
12. ✅ Verify sheet in Google Drive
13. ✅ Publish form
14. ✅ Share form URL
15. ✅ Submit form (incognito)
16. ✅ Check Google Sheet for data
17. ✅ Check dashboard for submission

**Time:** ~5 minutes
**Success Criteria:** All steps complete without errors

---

### Test Case 2: Form Builder Features

**Scenario:** Test all form builder capabilities

**Field Types:**
- [ ] Text input
- [ ] Email input
- [ ] Textarea
- [ ] Select dropdown
- [ ] Radio buttons
- [ ] Checkboxes
- [ ] Number input
- [ ] Date input
- [ ] Phone input

**Field Operations:**
- [ ] Add field
- [ ] Edit field label
- [ ] Edit placeholder
- [ ] Toggle required
- [ ] Add options (for select/radio/checkbox)
- [ ] Reorder fields (up/down arrows)
- [ ] Duplicate field
- [ ] Delete field

**Theme Customization:**
- [ ] Change primary color → Preview updates
- [ ] Change background color → Preview updates
- [ ] Change text color → Preview updates
- [ ] Change border radius → Preview updates
- [ ] Change font family → Preview updates

**Settings:**
- [ ] Edit form title
- [ ] Edit description
- [ ] Toggle show title
- [ ] Toggle show description
- [ ] Change submit button text
- [ ] Change success message
- [ ] Add redirect URL
- [ ] Toggle collect email
- [ ] Toggle multiple submissions

---

### Test Case 3: Google Sheets Advanced

**Scenario:** Test edge cases and advanced features

**Tests:**
1. **Create Multiple Sheets:**
   - Create Form A → Connect Sheet A
   - Create Form B → Connect Sheet B
   - Submit to both
   - Verify data goes to correct sheets

2. **Sheet with Special Characters:**
   - Create sheet named: "Test's Form (2024) - Responses"
   - Should handle special characters

3. **Long Form Data:**
   - Create form with 10+ fields
   - Submit with long text in textarea
   - Verify all data syncs correctly

4. **Concurrent Submissions:**
   - Submit form 5 times quickly
   - All should sync to sheet
   - No missing rows

5. **Sheet Permissions:**
   - Share Google Sheet with another account
   - Verify they can see submissions
   - Verify they can't edit via app

---

### Test Case 4: Google Calendar Advanced

**Scenario:** Test calendar event creation with various configurations

**Tests:**
1. **Basic Event:**
   - Form with date field only
   - Should create all-day event

2. **Timed Event:**
   - Form with date + time fields
   - Should create event at specific time

3. **Event with Attendees:**
   - Form with email field
   - Configure as attendee field
   - Attendee should receive invite

4. **Custom Event Template:**
   - Set titleTemplate: "Meeting with {{name}}"
   - Set descriptionTemplate: "Contact: {{email}}"
   - Submit form
   - Event should have custom title/description

5. **Multiple Timezones:**
   - Set timezone to "America/New_York"
   - Submit from different timezone
   - Event should be correct in NY time

---

## 📊 Success Metrics

### Functionality
- [ ] 100% of core features work
- [ ] 95%+ of edge cases handled
- [ ] 0 critical bugs
- [ ] < 5 minor bugs

### Performance
- [ ] All pages load < 3s
- [ ] Autosave < 2s
- [ ] Google API calls < 5s
- [ ] No UI blocking

### User Experience
- [ ] Intuitive navigation
- [ ] Clear error messages
- [ ] Smooth animations
- [ ] Mobile friendly

### Integration
- [ ] Google Sheets sync: 100%
- [ ] Calendar events: 95%+
- [ ] Token refresh: 100%
- [ ] Error recovery: 100%

---

## 🐛 Bug Tracking

### Critical Bugs (Must Fix)
- [ ] None found

### High Priority
- [ ] None found

### Medium Priority
- [ ] None found

### Low Priority / Enhancements
- [ ] Add batch sheet sync
- [ ] Add calendar event templates UI
- [ ] Add sheet column mapping
- [ ] Add webhook notifications

---

## 📝 Test Results Template

```
Test Date: [DATE]
Tester: [NAME]
Environment: [DEV/STAGING/PROD]

TEST 1: Authentication
Status: [PASS/FAIL]
Notes: 

TEST 2: Google Connection
Status: [PASS/FAIL]
Notes:

TEST 3: Form Creation
Status: [PASS/FAIL]
Notes:

TEST 4: Google Sheets
Status: [PASS/FAIL]
Notes:

TEST 5: Google Calendar
Status: [PASS/FAIL]
Notes:

TEST 6: Share & Embed
Status: [PASS/FAIL]
Notes:

TEST 7: Dashboard
Status: [PASS/FAIL]
Notes:

TEST 8: Mobile
Status: [PASS/FAIL]
Notes:

TEST 9: Error Handling
Status: [PASS/FAIL]
Notes:

TEST 10: Performance
Status: [PASS/FAIL]
Notes:

Overall Status: [PASS/FAIL]
Critical Issues: [COUNT]
Notes:
```

---

## 🚀 Ready to Test!

**Start with:**
1. ✅ Run migration
2. ✅ Check environment variables
3. ✅ Start dev server
4. ✅ Begin with TEST 1

**Test in this order:**
1. Authentication (foundation)
2. Google Connection (core feature)
3. Form Creation (main functionality)
4. Google Sheets (integration)
5. Google Calendar (integration)
6. Share & Embed (distribution)
7. Dashboard (data display)
8. Mobile (responsiveness)
9. Error Handling (reliability)
10. Performance (optimization)

**Good luck! 🎉**

