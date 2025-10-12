# Google Integrations Testing Guide

## 🧪 Step-by-Step Testing

### Prerequisites Checklist

Before testing, ensure:
- [ ] `supabase-migrations-v2.sql` has been run successfully
- [ ] `googleapis` package is installed (`npm install googleapis`)
- [ ] Environment variables are set in `.env.local`:
  ```env
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
  GOOGLE_CLIENT_SECRET=your_client_secret
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  ```
- [ ] Dev server is running (`npm run dev`)
- [ ] You have a Google account to test with

---

## Test 1: Google OAuth Connection (Signup Flow)

### Steps:
1. **Create New Account**
   - Go to http://localhost:3000/auth/signup
   - Enter email and password
   - Click "Create account"

2. **Welcome Page Should Appear**
   - Should see "Connect Google Workspace" page
   - Should see 3 benefit cards (Sheets, Calendar, Security)
   - Should see permissions list
   - Should see "Connect Google Account" and "Skip for Now" buttons

3. **Test Skip Option**
   - Click "Skip for Now"
   - Should redirect to dashboard
   - Should land on empty dashboard

4. **Test Connect Option**
   - Sign up with a different email
   - On welcome page, click "Connect Google Account"
   - Should redirect to Google OAuth consent screen
   - Grant permissions
   - Should redirect back to dashboard

### Expected Results:
- ✅ Welcome page displays correctly
- ✅ Skip button works
- ✅ Connect button redirects to Google
- ✅ OAuth flow completes
- ✅ Tokens stored in database

### Check Database:
```sql
SELECT * FROM user_google_tokens WHERE user_id = 'your_user_id';
```
Should see: access_token, refresh_token, expires_at

---

## Test 2: Google Sheets Connection

### Steps:
1. **Navigate to Form Editor**
   - Go to Dashboard → Forms
   - Click "Create New Form"
   - Add 2-3 fields (Name, Email, Message)
   - Go to "Settings" tab
   - Scroll to "Google Integrations"

2. **Check Connection Status**
   - If Google not connected: Should see "Connect Google Account" button
   - If Google connected: Should see Google Sheets card

3. **Connect Google Sheets**
   - Click "Connect Google Sheet"
   - Dialog should open
   - Enter sheet name: "Test Form Responses"
   - Click "Create Sheet"

4. **Verify Sheet Creation**
   - Should see loading indicator
   - Should see success message
   - Card should show "Connected" badge
   - Should show sheet name with "Open" button
   - Click "Open" button
   - Should open Google Sheet in new tab

5. **Check Sheet Contents**
   - Sheet should have headers: Timestamp, Name, Email, Message
   - Sheet should be in your Google Drive

### Expected Results:
- ✅ Integration panel displays
- ✅ Create sheet dialog works
- ✅ Sheet created in Google Drive
- ✅ Headers match form fields
- ✅ Connection saved to database

### Check Database:
```sql
SELECT * FROM sheet_connections WHERE user_id = 'your_user_id';
SELECT default_sheet_connection_id FROM forms WHERE id = 'your_form_id';
```

### Check Browser Console:
- Should see: "✓ Sheet created successfully"
- No errors

---

## Test 3: Form Submission with Sheets Sync

### Steps:
1. **Publish the Form**
   - In form editor, click "Publish"
   - Should see status change to "Published"

2. **Get Form URL**
   - Click "Share" button
   - Copy form URL from Link tab

3. **Submit Test Data**
   - Open form URL in incognito/new tab
   - Fill out the form:
     - Name: "Test User"
     - Email: "test@example.com"
     - Message: "This is a test submission"
   - Click "Submit"
   - Should see success message

4. **Check Google Sheet**
   - Open the Google Sheet
   - Refresh if needed
   - Should see new row with:
     - Timestamp
     - Test User
     - test@example.com
     - This is a test submission

5. **Submit Another**
   - Submit form again with different data
   - Check sheet - should see second row

### Expected Results:
- ✅ Form submits successfully
- ✅ Data appears in dashboard submissions
- ✅ Data appears in Google Sheet
- ✅ Timestamp is correct
- ✅ Field order matches headers

### Check Server Console:
```
Saving form submission...
✓ Submission saved to database
Starting background tasks...
✓ Synced to Google Sheets
```

### Check Browser Console:
- No errors
- Submission successful

---

## Test 4: Google Calendar Connection

### Steps:
1. **Open Form Settings**
   - Go to form editor → Settings tab
   - Scroll to Google Integrations

2. **Connect Calendar**
   - Click "Connect Google Calendar"
   - Dialog should open with calendar list
   - Should see your Google calendars
   - Select "Primary" or any calendar
   - Click to select

3. **Verify Connection**
   - Dialog should close
   - Card should show "Connected" badge
   - Should see "Calendar connected" message

### Expected Results:
- ✅ Calendar list loads
- ✅ Can select calendar
- ✅ Connection saved
- ✅ Status updates

### Check Database:
```sql
SELECT default_calendar_id FROM forms WHERE id = 'your_form_id';
```
Should see: calendar ID (usually "primary" or email address)

---

## Test 5: Calendar Event Creation (Advanced)

### Steps:
1. **Create Form with Date/Time Fields**
   - Create new form
   - Add fields:
     - Name (text)
     - Email (email)
     - Date (date)
     - Time (text) - e.g., "14:00"
   - Connect Google Calendar

2. **Configure Calendar Settings** (Optional)
   - In database, update form's calendar_settings:
   ```json
   {
     "startDateField": "date_field_id",
     "startTimeField": "time_field_id",
     "titleTemplate": "Appointment with {{name}}",
     "descriptionTemplate": "Email: {{email}}",
     "attendeeField": "email_field_id",
     "timeZone": "America/New_York"
   }
   ```

3. **Submit Form**
   - Fill out form with:
     - Name: "John Doe"
     - Email: "john@example.com"
     - Date: Tomorrow's date
     - Time: "14:00"
   - Submit

4. **Check Google Calendar**
   - Open Google Calendar
   - Navigate to tomorrow
   - Should see event at 2:00 PM
   - Event title: "Appointment with John Doe"
   - Event description: "Email: john@example.com"

### Expected Results:
- ✅ Event created in calendar
- ✅ Correct date/time
- ✅ Template variables replaced
- ✅ Attendee invited (if configured)

### Check Server Console:
```
✓ Synced to Google Sheets
✓ Created calendar event
```

---

## Test 6: Token Refresh

### Steps:
1. **Manually Expire Token**
   - In database, set expires_at to past timestamp:
   ```sql
   UPDATE user_google_tokens 
   SET expires_at = 0 
   WHERE user_id = 'your_user_id';
   ```

2. **Try Using Integration**
   - Submit a form
   - Or try creating a sheet

3. **Check Token Refresh**
   - Should work without errors
   - Check database - expires_at should be updated
   - Check console - should see token refresh

### Expected Results:
- ✅ Token automatically refreshed
- ✅ Operation completes successfully
- ✅ New expiry time set

---

## Test 7: Error Handling

### Test Scenarios:

**A. Disconnected Google Account**
1. Delete tokens from database
2. Try to create sheet
3. Should see "Google authentication required"

**B. Deleted Sheet**
1. Delete Google Sheet from Drive
2. Submit form
3. Submission should still save
4. Check console for sheet sync error
5. User should not see error

**C. Invalid Calendar ID**
1. Set invalid calendar_id in form
2. Submit form
3. Submission should still save
4. Check console for calendar error
5. User should not see error

### Expected Results:
- ✅ Graceful error handling
- ✅ Submissions never fail
- ✅ Errors logged but not shown to users
- ✅ Background tasks fail silently

---

## Test 8: Multiple Forms

### Steps:
1. **Create 3 Forms**
   - Form A: Connect to Sheet A
   - Form B: Connect to Sheet B
   - Form C: No sheet connection

2. **Submit to Each Form**
   - Submit to Form A → Check Sheet A
   - Submit to Form B → Check Sheet B
   - Submit to Form C → No sheet sync

3. **Verify Isolation**
   - Form A submissions only in Sheet A
   - Form B submissions only in Sheet B
   - No cross-contamination

### Expected Results:
- ✅ Each form syncs to correct sheet
- ✅ No data mixing
- ✅ Forms without sheets still work

---

## 🐛 Common Issues & Solutions

### Issue: "Google authentication required"
**Cause:** User hasn't connected Google account
**Solution:** 
1. Go to welcome page: `/auth/welcome`
2. Or add "Connect Google" button in settings

### Issue: "Failed to create sheet"
**Possible Causes:**
- Invalid Google credentials
- API not enabled in Google Cloud Console
- Network error

**Debug:**
1. Check browser console for errors
2. Check server logs
3. Verify Google Cloud Console:
   - Google Sheets API enabled?
   - Google Drive API enabled?
   - OAuth credentials correct?

### Issue: "Sheet not syncing"
**Possible Causes:**
- Sheet deleted
- Permissions revoked
- Token expired and refresh failed

**Debug:**
1. Check if sheet exists in Google Drive
2. Check server console for sync errors
3. Try reconnecting Google account

### Issue: "Calendar events not creating"
**Possible Causes:**
- Calendar deleted
- Invalid date/time format
- Field mappings incorrect

**Debug:**
1. Check calendar exists
2. Verify date/time fields in submission
3. Check calendar_settings in database
4. Look for errors in server console

---

## 📊 Verification Queries

### Check Google Connection
```sql
SELECT 
  u.email,
  gt.access_token IS NOT NULL as has_access_token,
  gt.refresh_token IS NOT NULL as has_refresh_token,
  gt.expires_at > EXTRACT(EPOCH FROM NOW()) * 1000 as token_valid
FROM auth.users u
LEFT JOIN user_google_tokens gt ON u.id = gt.user_id
WHERE u.id = 'your_user_id';
```

### Check Sheet Connections
```sql
SELECT 
  f.title as form_name,
  sc.sheet_name,
  sc.sheet_url,
  sc.created_at
FROM forms f
LEFT JOIN sheet_connections sc ON f.default_sheet_connection_id = sc.id
WHERE f.user_id = 'your_user_id';
```

### Check Submissions Synced
```sql
SELECT 
  f.title as form_name,
  COUNT(s.id) as total_submissions,
  sc.sheet_name
FROM forms f
LEFT JOIN submissions s ON f.id = s.form_id
LEFT JOIN sheet_connections sc ON f.default_sheet_connection_id = sc.id
WHERE f.user_id = 'your_user_id'
GROUP BY f.id, f.title, sc.sheet_name;
```

---

## ✅ Success Criteria

### Google OAuth
- [ ] Welcome page displays after signup
- [ ] Can skip Google connection
- [ ] Can connect Google account
- [ ] OAuth consent screen appears
- [ ] Tokens stored in database
- [ ] Redirects to dashboard

### Google Sheets
- [ ] Can create new sheet
- [ ] Sheet appears in Google Drive
- [ ] Headers match form fields
- [ ] Can open sheet from app
- [ ] Submissions sync automatically
- [ ] Data appears in correct columns

### Google Calendar
- [ ] Can list calendars
- [ ] Can select calendar
- [ ] Connection saved
- [ ] Events created from submissions
- [ ] Event details correct
- [ ] Attendees invited (if configured)

### Error Handling
- [ ] Graceful when Google disconnected
- [ ] Submissions never fail
- [ ] Errors logged properly
- [ ] User sees helpful messages

---

## 🚀 Quick Test Script

Run these tests in order:

```bash
# 1. Check environment
echo "Checking .env.local..."
# Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set

# 2. Check database
echo "Checking database tables..."
# Run: SELECT tablename FROM pg_tables WHERE schemaname = 'public';
# Should see: forms, submissions, form_views, sheet_connections, user_google_tokens

# 3. Test signup flow
echo "Test 1: Signup with Google prompt"
# Navigate to /auth/signup
# Create account
# Should see welcome page

# 4. Test sheet creation
echo "Test 2: Create Google Sheet"
# Create form → Settings → Connect Sheet
# Should create sheet successfully

# 5. Test submission sync
echo "Test 3: Submit form and check sheet"
# Publish form → Submit → Check Google Sheet
# Should see data in sheet

# 6. Test calendar
echo "Test 4: Connect calendar"
# Settings → Connect Calendar
# Should list calendars

echo "✅ All tests complete!"
```

---

## 📞 Need Help?

If any test fails:
1. Check browser console (F12)
2. Check server terminal for logs
3. Check Supabase logs
4. Verify Google Cloud Console setup
5. Check database with SQL queries above

---

**Ready to test? Start with Test 1!** 🚀

