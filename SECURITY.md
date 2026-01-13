# Security Architecture

This document outlines the security architecture and best practices for the ShelfCue forms application.

## Overview

The application uses Supabase for backend services with a multi-layered security approach:
1. **Row Level Security (RLS)** policies on all tables
2. **Server-side validation** in API routes using service role
3. **Storage policies** for file access control
4. **RPC function hardening** for administrative operations

## Authentication Layers

### Client-Side (Browser)
- Uses **anon key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- All database access filtered through RLS policies
- Cannot access other users' data or drafts

### Server-Side (API Routes)
- Uses **service role key** (`SUPABASE_SERVICE_ROLE_KEY`) 
- Bypasses RLS for administrative operations
- **MUST validate user permissions manually**
- Never expose service role key to client

## Row Level Security (RLS) Policies

### Forms Table
- **Authenticated users**: Can CRUD their own forms
- **Anonymous users**: Can SELECT published forms only
- **Draft forms**: Only visible to owner

### Submissions Tables (submissions, form_submissions)
- **Form owners**: Can SELECT submissions to their forms
- **Anyone**: Can INSERT submissions to published forms
- **No user**: Can SELECT submissions they didn't create

### Form Assets (storage.objects)
- **Public read**: Anyone can view uploaded assets
- **Authenticated write**: Users can upload/modify/delete files in their folder only
- **Folder structure**: `{user_id}/{filename}`

### Analytics & Logs
- **Form owners**: Can SELECT analytics/logs for their forms
- **Backend only**: Inserts performed by service role

### Billing & Subscriptions
- **Users**: Can SELECT their own subscription/invoice data only
- **No updates**: Billing changes via Paystack webhook (service role)

## API Route Security Patterns

### Public Form Access
```typescript
// GET /api/forms/[formId]
// Returns published forms to anyone, drafts only to owner
const supabaseAdmin = getSupabaseAdmin();
const form = await supabaseAdmin.from("forms")
  .select("*")
  .eq("id", formId)
  .single();

// Security check: If not owner, only return published
if (form.user_id !== currentUserId && form.status !== "published") {
  return { error: "Not found" };
}
```

### Protected Operations
```typescript
// PUT /api/forms/[formId]
// Requires authentication + ownership
const supabase = await createServerClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return { error: "Unauthorized" };
}

// Verify ownership before modification
const existingForm = await getForm(formId);
if (existingForm.user_id !== user.id) {
  return { error: "Forbidden" };
}
```

### Submission Endpoints
```typescript
// POST /api/submit
// Anyone can submit to published forms
const supabaseAdmin = getSupabaseAdmin();

// Verify form is published
const form = await supabaseAdmin.from("forms")
  .select("status, user_id")
  .eq("id", formId)
  .eq("status", "published")
  .single();

if (!form) {
  return { error: "Form not found or not published" };
}

// Check submission limits for form owner (not submitter)
const limitCheck = await canPerformAction(
  form.user_id, 
  "submissions_per_month"
);
```

## Storage Security

### Form Assets Bucket (`form-assets`)
- **Public**: Yes (for published form viewing)
- **RLS Policies**:
  - Public: SELECT (anyone can view)
  - Authenticated: INSERT/UPDATE/DELETE (own folder only)
- **File Path Pattern**: `{user_id}/{filename}`

### Validation
```typescript
// File uploads must:
// 1. Be from authenticated user
// 2. Upload to their own folder (auth.uid())
// 3. Meet size/type restrictions
const filePath = `${userId}/${file.name}`;
```

## RPC Function Security

### schema_cache_reload()
```sql
CREATE OR REPLACE FUNCTION schema_cache_reload()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
SET search_path = public
AS $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
END;
$$;

-- Restrict to service role only
REVOKE EXECUTE ON FUNCTION schema_cache_reload() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION schema_cache_reload() TO service_role;
```

### update_expired_trials()
```sql
-- SECURITY DEFINER allows updating forms/subscriptions
-- Should only be called by:
-- 1. Scheduled cron job (via service role)
-- 2. Edge functions with service role access
CREATE OR REPLACE FUNCTION update_expired_trials()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Function body...
$$;
```

## Environment Variables

### Required (Backend Only - Never Expose to Client)
- `SUPABASE_SERVICE_ROLE_KEY` - Full database access
- `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `PAYSTACK_SECRET_KEY` - Payment processing

### Required (Public - Safe to Expose)
- `NEXT_PUBLIC_SUPABASE_URL` - Database URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Client key (RLS enforced)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - OAuth client ID
- `NEXT_PUBLIC_APP_URL` - Application URL

## Common Security Pitfalls

### ❌ DON'T
```typescript
// Never use service role on client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // WRONG!
);

// Never trust client-provided user_id
const { userId } = await request.json();
await db.update({ user_id: userId }); // UNSAFE!

// Never expose drafts to non-owners
return allForms; // Includes drafts!
```

### ✅ DO
```typescript
// Use server client for authenticated operations
const supabase = await createServerClient();
const { data: { user } } = await supabase.auth.getUser();

// Always get user from server session
if (!user) return { error: "Unauthorized" };

// Filter by ownership
const forms = await db
  .from("forms")
  .select("*")
  .eq("user_id", user.id);

// Check published status for public access
if (form.status !== "published" && form.user_id !== userId) {
  return { error: "Not found" };
}
```

## Testing Security

### Manual Tests

1. **Anonymous Access**
   ```bash
   # Should succeed: View published form
   curl https://app.shelfcue.com/api/forms/{published-form-id}
   
   # Should fail: View draft form
   curl https://app.shelfcue.com/api/forms/{draft-form-id}
   
   # Should succeed: Submit to published form
   curl -X POST https://app.shelfcue.com/api/submit \
     -d '{"formId": "...", "data": {...}}'
   ```

2. **Cross-User Access**
   ```bash
   # Login as User A
   # Try to access User B's forms
   # Should return empty or error
   ```

3. **Storage Access**
   ```bash
   # View public image (should work)
   curl https://{supabase-url}/storage/v1/object/public/form-assets/{user-id}/logo.png
   
   # Upload without auth (should fail)
   curl -X POST https://{supabase-url}/storage/v1/object/form-assets/{user-id}/test.png
   ```

### Automated Tests (To Implement)
- [ ] RLS policy tests (Supabase test suite)
- [ ] API route authorization tests
- [ ] Storage permission tests
- [ ] Subscription limit enforcement tests

## Incident Response

If a security issue is discovered:

1. **Assess Impact**: Determine scope of data exposure
2. **Immediate Mitigation**: 
   - Revoke compromised keys
   - Add/update RLS policies
   - Deploy hotfix
3. **User Notification**: If user data was exposed
4. **Post-Mortem**: Document issue and prevention steps

## Security Checklist for New Features

- [ ] Does this expose user data?
- [ ] Is RLS enabled on new tables?
- [ ] Are API routes using proper auth checks?
- [ ] Are service role operations validated?
- [ ] Are file uploads restricted to user folders?
- [ ] Are subscription limits checked?
- [ ] Is sensitive data filtered from responses?
- [ ] Are error messages non-revealing?

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

