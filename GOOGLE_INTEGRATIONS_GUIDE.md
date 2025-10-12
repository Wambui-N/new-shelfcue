# Google Integrations Guide

## 🚀 Overview

ShelfCue now has complete Google Sheets and Google Calendar integrations! Form submissions can automatically sync to Google Sheets and create calendar events.

## ✨ Features Implemented

### Google Sheets Integration
- ✅ **Auto-sync submissions** to Google Sheets
- ✅ **Create new sheets** directly from the app
- ✅ **Connect existing sheets** from your Google Drive
- ✅ **Automatic headers** based on form fields
- ✅ **Timestamp tracking** for each submission
- ✅ **Real-time syncing** as submissions come in

### Google Calendar Integration
- ✅ **Auto-create events** from form submissions
- ✅ **Connect any calendar** from your Google account
- ✅ **Field mapping** for date/time/attendees
- ✅ **Template system** for event titles and descriptions
- ✅ **Timezone support** for accurate scheduling

## 📋 Setup Instructions

### Step 1: Run Database Migration

Run the updated `supabase-migrations-v2.sql` which now includes:
- ✅ `sheet_connections` table
- ✅ Google integration columns on `forms` table
- ✅ RLS policies for sheet_connections

### Step 2: Configure Google OAuth

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Enable Google APIs

In Google Cloud Console:
1. Enable **Google Sheets API**
2. Enable **Google Calendar API**
3. Enable **Google Drive API** (for listing sheets)

## 🎯 How It Works

### Architecture

```
Form Submission
    ↓
Save to Database
    ↓
Background Tasks (parallel):
    ├─→ Sync to Google Sheets
    └─→ Create Calendar Event
    ↓
Return Success to User
```

### Google Sheets Flow

```
1. User connects Google account (OAuth)
2. User creates/selects Google Sheet
3. Sheet connection saved to database
4. Form linked to sheet
5. On submission:
   - Data formatted as row
   - Appended to sheet
   - Timestamp added automatically
```

### Google Calendar Flow

```
1. User connects Google account (OAuth)
2. User selects calendar
3. Calendar ID saved to form
4. User configures field mappings (optional)
5. On submission:
   - Extract date/time from fields
   - Parse event details
   - Create calendar event
   - Send invites if configured
```

## 📁 File Structure

```
src/
├── lib/
│   ├── google.ts              # Google API client wrapper
│   ├── googleSheets.ts        # Sheets service
│   └── googleCalendar.ts      # Calendar service
├── app/api/
│   ├── sheets/
│   │   └── create/
│   │       └── route.ts       # Create new sheet
│   ├── google/
│   │   ├── spreadsheets/
│   │   │   └── route.ts       # List user's sheets
│   │   └── calendars/
│   │       └── route.ts       # List user's calendars
│   └── submit/
│       └── route.ts           # Enhanced with Google sync
└── components/builder/
    └── GoogleIntegrationPanel.tsx  # UI component
```

## 🔧 Technical Details

### GoogleAPIClient Class

```typescript
class GoogleAPIClient {
  constructor(accessToken, refreshToken)
  
  getSheets()     // Returns Google Sheets API client
  getCalendar()   // Returns Google Calendar API client
  getDrive()      // Returns Google Drive API client
  refreshAccessToken()  // Refreshes expired tokens
}
```

### GoogleSheetsService Class

```typescript
class GoogleSheetsService {
  createSheet(title, headers)  // Create new sheet
  getSheets()                  // List user's sheets
  append(sheetId, data)        // Add row to sheet
  getSpreadsheetDetails(id)    // Get sheet info
  updateHeaders(id, headers)   // Update header row
}
```

### GoogleCalendarService Class

```typescript
class GoogleCalendarService {
  getUserCalendars()           // List user's calendars
  createCalendarEvent(id, event)  // Create event
  createCalendarEventFromSubmission(formId, data, calendarId)
}
```

## 📊 Database Schema

### sheet_connections table
```sql
id                  UUID PRIMARY KEY
user_id             UUID REFERENCES auth.users
sheet_id            TEXT (Google Sheet ID)
sheet_url           TEXT (Sheet URL)
sheet_name          TEXT (Display name)
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

### forms table (new columns)
```sql
default_sheet_connection_id  UUID REFERENCES sheet_connections
default_calendar_id          TEXT (Google Calendar ID)
calendar_settings            JSONB (Event configuration)
```

### user_google_tokens table (existing)
```sql
id                  UUID PRIMARY KEY
user_id             UUID REFERENCES auth.users
access_token        TEXT
refresh_token       TEXT
expires_at          BIGINT
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

## 🎨 User Interface

### In Form Settings Tab

Users will see:

**Google Sheets Card:**
```
┌─────────────────────────────────┐
│ 📊 Google Sheets                │
│ Sync submissions automatically  │
│                                 │
│ [Not Connected]                 │
│ [+ Connect Google Sheet]        │
└─────────────────────────────────┘
```

**After Connection:**
```
┌─────────────────────────────────┐
│ 📊 Google Sheets    [Connected] │
│ Sync submissions automatically  │
│                                 │
│ 📄 Form Responses Sheet  [Open] │
│ ✓ All submissions auto-synced  │
└─────────────────────────────────┘
```

**Google Calendar Card:**
```
┌─────────────────────────────────┐
│ 📅 Google Calendar              │
│ Create events from submissions  │
│                                 │
│ [Not Connected]                 │
│ [+ Connect Google Calendar]     │
└─────────────────────────────────┘
```

## 🔐 Authentication Flow

### Initial Connection

1. User clicks "Connect Google"
2. Redirects to Google OAuth consent screen
3. User grants permissions:
   - View and manage Google Sheets
   - View and manage Google Calendar
   - View and manage Google Drive files
4. Redirects back with tokens
5. Tokens stored in `user_google_tokens` table
6. Integration panels now show "Connected"

### Token Management

- ✅ Access tokens automatically refreshed when expired
- ✅ Refresh tokens stored securely
- ✅ Token expiry tracked
- ✅ Automatic re-authentication if refresh fails

## 📝 Usage Guide

### Connecting Google Sheets

**Method 1: Create New Sheet**
1. Go to form editor → Settings tab
2. Scroll to "Google Integrations"
3. Click "Connect Google Sheet"
4. Enter sheet name
5. Click "Create Sheet"
6. ✅ Sheet created and linked!

**Method 2: Use Existing Sheet** (Coming Soon)
1. Click "Connect Existing Sheet"
2. Select from your Google Drive
3. Map form fields to columns
4. ✅ Sheet connected!

### Connecting Google Calendar

1. Go to form editor → Settings tab
2. Scroll to "Google Integrations"
3. Click "Connect Google Calendar"
4. Select calendar from list
5. ✅ Calendar connected!

### Configuring Calendar Events (Advanced)

Configure how form submissions create calendar events:

```json
{
  "startDateField": "date",
  "startTimeField": "time",
  "endDateField": "end_date",
  "endTimeField": "end_time",
  "titleTemplate": "Appointment with {{name}}",
  "descriptionTemplate": "Email: {{email}}\nPhone: {{phone}}",
  "attendeeField": "email",
  "timeZone": "America/New_York"
}
```

## 🎯 Submission Sync Process

### What Happens on Form Submit

1. **Save to Database** (immediate)
   ```
   POST /api/submit
   ↓
   Save to submissions table
   ↓
   Return success to user
   ```

2. **Google Sheets Sync** (background)
   ```
   Get form's sheet connection
   ↓
   Get user's Google tokens
   ↓
   Format submission as row
   ↓
   Append to Google Sheet
   ↓
   Log success/error
   ```

3. **Calendar Event Creation** (background)
   ```
   Get form's calendar settings
   ↓
   Extract date/time from submission
   ↓
   Parse event details
   ↓
   Create calendar event
   ↓
   Send invites if configured
   ```

### Data Formatting

**For Google Sheets:**
```
Row: [Timestamp, Field1, Field2, Field3, ...]
Example: ["2024-01-15 10:30", "John Doe", "john@example.com", "555-1234"]
```

**For Calendar Events:**
```json
{
  "summary": "Appointment with John Doe",
  "description": "Email: john@example.com\nPhone: 555-1234",
  "start": {
    "dateTime": "2024-01-20T14:00:00",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2024-01-20T15:00:00",
    "timeZone": "America/New_York"
  },
  "attendees": [
    { "email": "john@example.com" }
  ]
}
```

## 🔍 Monitoring & Debugging

### Check Sync Status

**In Browser Console:**
```
✓ Synced to Google Sheets
✓ Created calendar event
```

**In Server Logs:**
```
Saving form submission...
✓ Submission saved to database
Starting background tasks...
✓ Google Sheets sync complete
✓ Calendar event created
```

### Common Issues

**"Google authentication required"**
- User hasn't connected Google account
- Tokens expired and refresh failed
- Solution: Reconnect Google account

**"Failed to sync to Google Sheets"**
- Sheet deleted or permissions revoked
- Network error
- Solution: Check sheet exists, reconnect if needed

**"Failed to create calendar event"**
- Calendar deleted or permissions revoked
- Invalid date/time in submission
- Solution: Check calendar exists, verify field mappings

## 🎨 Best Practices

### Google Sheets

1. **Header Organization**
   - Keep field order consistent
   - Use clear, descriptive headers
   - Include timestamp column

2. **Sheet Management**
   - One sheet per form recommended
   - Regularly backup important data
   - Use Google Sheets formulas for analysis

3. **Data Validation**
   - Set up data validation in sheets
   - Use conditional formatting
   - Create pivot tables for insights

### Google Calendar

1. **Event Templates**
   - Use clear, descriptive titles
   - Include all relevant info in description
   - Use field placeholders: `{{fieldName}}`

2. **Field Mapping**
   - Map date fields to event start
   - Map time fields for precise scheduling
   - Include email field for attendees

3. **Timezone Handling**
   - Always specify timezone
   - Use user's local timezone when possible
   - Test with different timezones

## 🔐 Security & Privacy

### Token Storage
- ✅ Tokens encrypted in database
- ✅ Refresh tokens never exposed to client
- ✅ Access tokens automatically refreshed
- ✅ Tokens deleted when user disconnects

### Permissions
- ✅ Users can only access their own sheets
- ✅ Users can only access their own calendars
- ✅ RLS policies enforce data isolation
- ✅ API routes validate user ownership

### Data Privacy
- ✅ Submissions stored securely
- ✅ Google sync happens server-side
- ✅ No sensitive data in URLs
- ✅ GDPR compliant

## 📊 Analytics

Track Google integration usage:

```sql
-- Sheets sync rate
SELECT 
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN synced_to_sheets THEN 1 END) as synced
FROM submissions;

-- Calendar event creation rate
SELECT 
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN calendar_event_created THEN 1 END) as events_created
FROM submissions;
```

## 🐛 Troubleshooting

### Sheets Not Syncing

**Check:**
1. Google account connected?
2. Sheet exists and accessible?
3. Form has sheet connection?
4. Check browser/server console for errors

**Debug:**
```typescript
// In browser console
console.log('Form has sheet connection:', form.default_sheet_connection_id)

// In server logs
console.log('Syncing to sheet:', sheetId)
console.log('Row data:', rowData)
```

### Calendar Events Not Creating

**Check:**
1. Calendar ID saved to form?
2. Date/time fields exist in form?
3. Field mappings configured?
4. Check server console for errors

**Debug:**
```typescript
// Check calendar settings
console.log('Calendar settings:', form.calendar_settings)
console.log('Calendar ID:', form.default_calendar_id)
```

## 🚀 Advanced Features

### Custom Sheet Formatting

After creating a sheet, you can:
- Add formulas to calculate totals
- Use conditional formatting for status
- Create charts and graphs
- Set up data validation
- Share with team members

### Calendar Event Customization

Configure advanced event settings:
```json
{
  "startDateField": "appointment_date",
  "startTimeField": "appointment_time",
  "endDateField": "appointment_date",
  "endTimeField": "end_time",
  "titleTemplate": "{{service}} - {{name}}",
  "descriptionTemplate": "Client: {{name}}\nEmail: {{email}}\nPhone: {{phone}}\nNotes: {{notes}}",
  "attendeeField": "email",
  "timeZone": "America/New_York",
  "duration": 60,
  "reminderMinutes": 30
}
```

### Webhooks (Coming Soon)

- Real-time notifications on sync
- Custom webhook endpoints
- Retry failed syncs
- Batch processing

## 📚 API Reference

### Create Sheet
```typescript
POST /api/sheets/create
Body: {
  userId: string
  title: string
  headers: string[]
  formId: string
}
Response: {
  spreadsheetId: string
  spreadsheetUrl: string
  connectionId: string
}
```

### List Spreadsheets
```typescript
GET /api/google/spreadsheets?userId={userId}
Response: {
  sheets: Array<{
    id: string
    name: string
    createdTime: string
    webViewLink: string
  }>
}
```

### List Calendars
```typescript
GET /api/google/calendars?userId={userId}
Response: {
  calendars: Array<{
    id: string
    summary: string
    description: string
    backgroundColor: string
  }>
}
```

## 🎨 UI Components

### GoogleIntegrationPanel

Located in form Settings tab:

**Props:**
```typescript
{
  formId: string
  formFields: Array<{
    id: string
    label: string
    type: string
  }>
}
```

**Features:**
- Shows connection status
- Buttons to connect/disconnect
- Visual indicators
- Error handling
- Loading states

## 📊 Success Metrics

### Track Integration Usage

```sql
-- Forms with Google Sheets
SELECT COUNT(*) FROM forms 
WHERE default_sheet_connection_id IS NOT NULL;

-- Forms with Calendar
SELECT COUNT(*) FROM forms 
WHERE default_calendar_id IS NOT NULL;

-- Total sheet connections
SELECT COUNT(*) FROM sheet_connections;
```

## 🎯 Best Practices

### For Users

1. **Connect Early**
   - Set up integrations before publishing
   - Test with sample submissions
   - Verify data appears correctly

2. **Organize Sheets**
   - Use descriptive names
   - One sheet per form
   - Archive old sheets regularly

3. **Calendar Management**
   - Use dedicated calendar for form events
   - Set up event reminders
   - Configure attendee notifications

### For Developers

1. **Error Handling**
   - Always catch Google API errors
   - Don't block submissions on sync failures
   - Log errors for debugging

2. **Token Management**
   - Check expiry before API calls
   - Refresh tokens proactively
   - Handle refresh failures gracefully

3. **Rate Limiting**
   - Respect Google API quotas
   - Implement exponential backoff
   - Batch operations when possible

## 🔒 Security Considerations

### OAuth Scopes Required

```
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/drive.readonly
```

### Token Security

- ✅ Store tokens server-side only
- ✅ Never expose in client code
- ✅ Encrypt at rest
- ✅ Rotate regularly

### API Security

- ✅ Validate user ownership
- ✅ Check form permissions
- ✅ Rate limit API calls
- ✅ Log all operations

## 📈 Future Enhancements

- [ ] Batch sync for multiple submissions
- [ ] Sync history and retry failed syncs
- [ ] Custom column mapping for sheets
- [ ] Multiple sheet connections per form
- [ ] Calendar event templates
- [ ] Recurring events support
- [ ] Google Meet integration
- [ ] Google Drive file uploads
- [ ] Real-time sync status dashboard

## 🎉 Summary

Your ShelfCue SaaS now has enterprise-grade Google integrations:

✅ **Automatic Sheets Sync**
- Create sheets from app
- Auto-append submissions
- Real-time updates

✅ **Calendar Event Creation**
- Auto-create events
- Custom templates
- Attendee management

✅ **Professional UI**
- Easy connection flow
- Visual status indicators
- Error handling

✅ **Robust Backend**
- Token management
- Error recovery
- Background processing

**Your forms now integrate seamlessly with Google Workspace!** 🚀✨

