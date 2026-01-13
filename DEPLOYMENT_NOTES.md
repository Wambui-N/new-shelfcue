# Deployment Notes - Security Hardening

## What Was Fixed

The storage policy error occurred because the `storage.objects` table is owned by `supabase_storage_admin`, not the default `postgres` role. 

### Solution Applied

Both storage migrations now properly set the role before creating policies:

```sql
-- Set role to storage admin to manage storage policies
SET LOCAL ROLE supabase_storage_admin;

-- Create storage policies...
CREATE POLICY "..." ON storage.objects ...

-- Reset role back to postgres
RESET ROLE;
```

This allows the migration to:
1. Temporarily assume storage admin privileges
2. Create/modify storage policies
3. Return to normal postgres role

## Migration Order & Execution

### Option 1: Via Supabase Dashboard (Recommended)

Run each migration in the Supabase Dashboard SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy/paste migration content
4. Run the query
5. Verify "Success" message
6. Repeat for each migration in order

**Order**:
1. `20250123_rls_policies_core_tables.sql`
2. `20250122_form_branding.sql` (if not already run)
3. `20250123_storage_public_read.sql`
4. `20250123_rpc_function_hardening.sql`

### Option 2: Via Supabase CLI

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push

# Or push specific migration
supabase migration up --db-url your-db-url --file 20250123_rls_policies_core_tables.sql
```

### Option 3: Via MCP Tools (If Available)

If you're using the Supabase MCP tools in this session:

```typescript
// Apply each migration
mcp_supabase_apply_migration({
  name: "rls_policies_core_tables",
  query: "<paste migration SQL here>"
});
```

## Verification After Deployment

### 1. Check RLS is Enabled

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

All tables should show `rowsecurity = true`.

### 2. Check Policies Exist

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Should show policies for:
- forms (5 policies)
- submissions (2 policies)
- form_submissions (2 policies)
- form_views (2 policies)
- form_files (2 policies)
- sheet_connections (4 policies)
- user_google_tokens (4 policies)
- And all other tables...

### 3. Check Storage Policies

```sql
SELECT * FROM storage.policies 
WHERE bucket_id = 'form-assets'
ORDER BY name;
```

Should show:
- Public can read form assets (SELECT, anon + authenticated)
- Users can upload form assets (INSERT, authenticated)
- Users can update their own form assets (UPDATE, authenticated)
- Users can delete their own form assets (DELETE, authenticated)

### 4. Check RPC Functions

```sql
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  CASE WHEN prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END as security_type,
  pg_catalog.pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('schema_cache_reload', 'update_expired_trials')
ORDER BY p.proname;
```

Both functions should show `SECURITY DEFINER`.

### 5. Test Public Form Access

```bash
# Should work: View published form
curl https://your-app.com/api/forms/{published-form-id}

# Should fail: View draft form
curl https://your-app.com/api/forms/{draft-form-id}
# Expected: {"error": "Form not found"}
```

### 6. Test Cross-User Access

```bash
# Login as User A, try to access User B's form
# Via browser console:
const { data } = await supabase
  .from('forms')
  .select('*')
  .eq('id', 'user-b-form-id');

// Expected: data = [] (RLS blocks it)
```

## Troubleshooting

### Error: "must be owner of relation objects"

**Cause**: Migration not running with storage admin role

**Fix**: 
- Ensure migration includes `SET LOCAL ROLE supabase_storage_admin;`
- Or run via Supabase Dashboard (has proper permissions)

### Error: "relation does not exist"

**Cause**: Table hasn't been created yet

**Fix**:
- Check if core tables exist
- May need to run initial schema migration first
- Create missing tables via Supabase Dashboard

### Error: "permission denied for function"

**Cause**: RPC function restrictions applied

**Fix**:
- This is expected! Functions are now restricted to service role
- Client calls should go through API routes
- API routes use service role key

### Warning: "policy already exists"

**Cause**: Re-running migration

**Fix**:
- Migrations use `DROP POLICY IF EXISTS` before `CREATE POLICY`
- This is safe and expected for idempotent migrations
- Warnings can be ignored

## Post-Deployment Actions

After successfully deploying migrations:

1. [ ] Test authentication flow
2. [ ] Test form creation
3. [ ] Test form publishing
4. [ ] Test anonymous form submission
5. [ ] Test image uploads
6. [ ] Check for errors in Supabase logs
7. [ ] Monitor for 30 minutes
8. [ ] Mark as complete in checklist

## Rollback (If Needed)

If issues arise, you can rollback the RLS policies:

```sql
-- Disable RLS (emergency only)
ALTER TABLE forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
-- ... etc for other tables ...

-- Or just drop problematic policies
DROP POLICY "Users can view their own forms" ON forms;
-- ... etc ...
```

**Note**: Only rollback if absolutely necessary. Review issues first.

## Contact

If you encounter issues:
1. Check Supabase logs for detailed error messages
2. Review `SECURITY.md` for architecture details
3. Use `SECURITY_TESTING_CHECKLIST.md` to verify setup
4. Check `ENVIRONMENT.md` for configuration issues

