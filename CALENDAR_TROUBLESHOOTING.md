# Calendar Integration Troubleshooting Guide

## Issue: Meeting times not being added to Google Calendar

I've added detailed logging to help identify the issue. Here's how to troubleshoot:

## Step 1: Check the Server Logs

When you submit a form with a meeting time, check your server console logs for these messages:

### ✅ What you should see if everything is working:

```
📅 Checking calendar configuration...
  - default_calendar_id: cal_xxxxx
  - user_id: user_xxxxx
  - submission data: { ... }
📅 Creating calendar event...
📅 [Calendar] Starting calendar event creation...
📅 [Calendar] User ID: user_xxxxx
📅 [Calendar] Form ID: form_xxxxx
✓ [Calendar] Google client obtained
📅 [Calendar] Form data: { hasForm: true, calendarId: 'primary', ... }
📅 [Calendar] Meeting field: { id: 'field_xxx', type: 'meeting', ... }
📅 [Calendar] Meeting time from submission: { fieldId: 'field_xxx', value: '2025-10-15T14:00:00' }
📅 [Calendar] Creating event: { ... }
✓ [Calendar] Event created successfully: { eventId: 'xxx', htmlLink: 'https://...' }
✓ Created calendar event: xxx
```

### Common Issues and Solutions:

#### 1. **Calendar not configured**
```
⚠️ Calendar not configured: { hasCalendarId: false, hasUserId: true }
```

**Solution:** 
- Go to your form editor
- Navigate to the form settings
- Connect a Google Calendar under the "Integrations" or "Calendar" section
- Make sure you've selected a calendar (usually "primary" for your main calendar)

#### 2. **No meeting field found**
```
⚠️ [Calendar] No meeting field found in form
```

**Solution:**
- Ensure your form has a field with type "meeting"
- Check the form builder to verify the meeting field exists
- The meeting field should have a proper ID and type set to "meeting"

#### 3. **No meeting time selected**
```
⚠️ [Calendar] No meeting time selected in submission
```

**Solution:**
- Make sure you actually selected a time when submitting the form
- Check that the meeting time picker is working properly
- Verify the form is passing the meeting time value correctly

#### 4. **Google not connected**
```
❌ [Calendar] Google client not available for user: user_xxxxx
```

**Solution:**
- Go to your dashboard
- Look for "Connect Google" or "Google Integration" section
- Click the connect button and authorize access
- Grant calendar permissions when prompted

## Step 2: Verify Form Configuration

Make sure your form is properly configured:

1. **Check Form Settings:**
   - Open the form in the editor
   - Go to Settings → Integrations
   - Verify "Google Calendar" is connected
   - Check that a calendar is selected (usually "primary")

2. **Check Meeting Field:**
   - Ensure the form has a meeting/date-time field
   - The field type should be "meeting"
   - The field should be visible and enabled

3. **Check Permissions:**
   - Verify you've granted Google Calendar access
   - Check that the Google Calendar API is enabled in your Google Cloud project

## Step 3: Test Again

1. Open your form
2. Fill in all required fields
3. **Select a meeting time** from the date/time picker
4. Submit the form
5. Check the server logs (in your terminal where you run `npm run dev`)
6. Check your Google Calendar

## Step 4: Check Google Calendar API Permissions

If you see API errors, verify:

1. **Google Cloud Console:**
   - Go to https://console.cloud.google.com
   - Select your project
   - Navigate to "APIs & Services" → "Enabled APIs & Services"
   - Ensure "Google Calendar API" is enabled

2. **OAuth Scopes:**
   - Check that your OAuth consent screen includes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`

3. **Re-authorize if needed:**
   - Disconnect Google in your dashboard
   - Reconnect and grant all permissions
   - Try submitting the form again

## Step 5: Common Error Messages

### "Invalid credentials" or "401 Unauthorized"
- Your Google OAuth token may have expired
- Solution: Disconnect and reconnect Google in your dashboard

### "403 Forbidden" or "Insufficient permissions"
- You haven't granted calendar permissions
- Solution: Revoke access in Google settings and reconnect with all permissions

### "Calendar not found"
- The calendar ID might be incorrect
- Solution: In form settings, select "primary" or choose a specific calendar

### "Invalid dateTime"
- The meeting time format is incorrect
- Check the server logs for the actual dateTime value being sent
- Should be in ISO 8601 format: `2025-10-15T14:00:00`

## Quick Checklist

Before submitting a form with a meeting time:

- [ ] Form has a meeting field (type: "meeting")
- [ ] Form is connected to Google Calendar
- [ ] You've connected your Google account in the dashboard
- [ ] Google Calendar API is enabled in Google Cloud Console
- [ ] You granted calendar permissions when connecting
- [ ] You selected a meeting time when filling the form
- [ ] Form has `default_calendar_id` set in the database

## Database Check

If nothing works, check your database directly:

```sql
-- Check if form has calendar configured
SELECT id, title, default_calendar_id, fields 
FROM forms 
WHERE id = 'your-form-id';

-- Check if user has Google tokens
SELECT user_id, expires_at 
FROM user_google_tokens 
WHERE user_id = 'your-user-id';
```

## Still Not Working?

Check the detailed logs in your terminal. The new logging will show exactly where the process fails. Look for:

1. ❌ Error messages (red X symbol)
2. ⚠️ Warning messages (yellow warning symbol)
3. The specific step where it stops

Share the relevant log messages if you need further assistance.

## Next Steps

Once you've enabled the logging and tested again:
1. Submit a form with a meeting time
2. Check your terminal for the detailed logs
3. Identify which step is failing
4. Follow the corresponding solution above

The logs will tell you exactly what's wrong! 🎯


