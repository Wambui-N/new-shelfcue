# Security Testing Checklist

This checklist should be completed when deploying security migrations to dev, staging, and production environments.

## Pre-Deployment

- [ ] Review all migration files for syntax errors
- [ ] Test migrations on local Supabase instance
- [ ] Backup production database (or ensure auto-backups are enabled)
- [ ] Notify team of upcoming security changes
- [ ] Schedule deployment during low-traffic period

## Migration Order

Run migrations in this order:

1. `20250123_rls_policies_core_tables.sql` - Core RLS policies
2. `20250123_storage_public_read.sql` - Storage public read access
3. `20250123_rpc_function_hardening.sql` - RPC security hardening

## Dev Environment Testing

### 1. RLS Policy Tests

#### Forms Table
- [ ] **Test 1.1**: Authenticated user can view their own forms
  ```sql
  -- Login as User A
  SELECT * FROM forms WHERE user_id = '{user-a-id}';
  -- Expected: Returns User A's forms
  ```

- [ ] **Test 1.2**: Authenticated user CANNOT view other users' forms
  ```sql
  -- Login as User A
  SELECT * FROM forms WHERE user_id = '{user-b-id}';
  -- Expected: Returns empty (blocked by RLS)
  ```

- [ ] **Test 1.3**: Anonymous user can view published forms
  ```sql
  -- No authentication
  SELECT * FROM forms WHERE status = 'published' AND id = '{published-form-id}';
  -- Expected: Returns the published form
  ```

- [ ] **Test 1.4**: Anonymous user CANNOT view draft forms
  ```sql
  -- No authentication
  SELECT * FROM forms WHERE status = 'draft' AND id = '{draft-form-id}';
  -- Expected: Returns empty (blocked by RLS)
  ```

- [ ] **Test 1.5**: User can create their own forms
  ```bash
  curl -X POST http://localhost:3000/api/forms/new \
    -H "Authorization: Bearer {user-token}" \
    -d '{"title": "Test Form"}'
  # Expected: 200 OK
  ```

- [ ] **Test 1.6**: User can update their own forms
  ```bash
  curl -X PUT http://localhost:3000/api/forms/{user-form-id} \
    -H "Authorization: Bearer {user-token}" \
    -d '{"title": "Updated Title"}'
  # Expected: 200 OK
  ```

- [ ] **Test 1.7**: User CANNOT update other users' forms
  ```bash
  curl -X PUT http://localhost:3000/api/forms/{other-user-form-id} \
    -H "Authorization: Bearer {user-token}" \
    -d '{"title": "Hacked"}'
  # Expected: 403 Forbidden
  ```

#### Submissions Tables
- [ ] **Test 2.1**: Form owner can view submissions to their forms
  ```sql
  -- Login as form owner
  SELECT * FROM submissions WHERE form_id IN (
    SELECT id FROM forms WHERE user_id = auth.uid()
  );
  -- Expected: Returns submissions
  ```

- [ ] **Test 2.2**: User CANNOT view submissions to others' forms
  ```sql
  -- Login as User A
  SELECT * FROM submissions WHERE form_id = '{user-b-form-id}';
  -- Expected: Returns empty (blocked by RLS)
  ```

- [ ] **Test 2.3**: Anonymous user can submit to published forms
  ```bash
  curl -X POST http://localhost:3000/api/submit \
    -d '{"formId": "{published-form-id}", "data": {"name": "Test"}}'
  # Expected: 200 OK
  ```

- [ ] **Test 2.4**: Anonymous user CANNOT submit to draft forms
  ```bash
  curl -X POST http://localhost:3000/api/submit \
    -d '{"formId": "{draft-form-id}", "data": {"name": "Test"}}'
  # Expected: 404 Not Found
  ```

- [ ] **Test 2.5**: User CANNOT view other users' submissions via client
  ```typescript
  // Login as User A in browser
  const { data } = await supabase
    .from('submissions')
    .select('*')
    .eq('form_id', userBFormId);
  // Expected: data = [] (empty)
  ```

#### Google Tokens Table
- [ ] **Test 3.1**: User can view their own tokens
  ```sql
  -- Login as User A
  SELECT * FROM user_google_tokens WHERE user_id = auth.uid();
  -- Expected: Returns User A's tokens
  ```

- [ ] **Test 3.2**: User CANNOT view other users' tokens
  ```sql
  -- Login as User A
  SELECT * FROM user_google_tokens WHERE user_id = '{user-b-id}';
  -- Expected: Returns empty (blocked by RLS)
  ```

- [ ] **Test 3.3**: User can update their own tokens
  ```bash
  curl -X PUT http://localhost:3000/api/google/tokens \
    -H "Authorization: Bearer {user-token}" \
    -d '{"access_token": "new-token"}'
  # Expected: 200 OK
  ```

#### Sheet Connections
- [ ] **Test 4.1**: User can view their own sheet connections
- [ ] **Test 4.2**: User CANNOT view other users' sheet connections
- [ ] **Test 4.3**: User can delete their own sheet connections

#### Subscription Tables
- [ ] **Test 5.1**: User can view their own subscription
- [ ] **Test 5.2**: User CANNOT view other users' subscriptions
- [ ] **Test 5.3**: User can view their own invoices
- [ ] **Test 5.4**: User CANNOT view other users' invoices

### 2. Storage Policy Tests

#### Form Assets Bucket
- [ ] **Test 6.1**: Anonymous user can view public form assets
  ```bash
  curl https://{supabase-url}/storage/v1/object/public/form-assets/{user-id}/logo.png
  # Expected: 200 OK, image returned
  ```

- [ ] **Test 6.2**: Authenticated user can upload to their own folder
  ```typescript
  const { data, error } = await supabase.storage
    .from('form-assets')
    .upload(`${userId}/test.png`, file);
  // Expected: success, no error
  ```

- [ ] **Test 6.3**: User CANNOT upload to another user's folder
  ```typescript
  const { data, error } = await supabase.storage
    .from('form-assets')
    .upload(`${otherUserId}/hack.png`, file);
  // Expected: error, upload blocked
  ```

- [ ] **Test 6.4**: User can delete their own assets
  ```typescript
  const { error } = await supabase.storage
    .from('form-assets')
    .remove([`${userId}/test.png`]);
  // Expected: no error
  ```

- [ ] **Test 6.5**: User CANNOT delete other users' assets
  ```typescript
  const { error } = await supabase.storage
    .from('form-assets')
    .remove([`${otherUserId}/logo.png`]);
  // Expected: error, deletion blocked
  ```

### 3. RPC Function Tests

#### schema_cache_reload()
- [ ] **Test 7.1**: Service role can call schema_cache_reload
  ```sql
  -- Using service role
  SELECT schema_cache_reload();
  -- Expected: Success
  ```

- [ ] **Test 7.2**: Authenticated user CANNOT call schema_cache_reload
  ```sql
  -- Using authenticated user
  SELECT schema_cache_reload();
  -- Expected: ERROR: permission denied
  ```

- [ ] **Test 7.3**: Anonymous user CANNOT call schema_cache_reload
  ```sql
  -- No authentication
  SELECT schema_cache_reload();
  -- Expected: ERROR: permission denied
  ```

#### update_expired_trials()
- [ ] **Test 8.1**: Service role can call update_expired_trials
- [ ] **Test 8.2**: Authenticated user CANNOT call update_expired_trials
- [ ] **Test 8.3**: Anonymous user CANNOT call update_expired_trials

### 4. API Route Security Tests

#### GET /api/forms/[formId]
- [ ] **Test 9.1**: Owner can access their own draft
  ```bash
  curl http://localhost:3000/api/forms/{draft-form-id} \
    -H "Authorization: Bearer {owner-token}"
  # Expected: 200 OK, form returned
  ```

- [ ] **Test 9.2**: Non-owner CANNOT access others' drafts
  ```bash
  curl http://localhost:3000/api/forms/{draft-form-id} \
    -H "Authorization: Bearer {other-user-token}"
  # Expected: 404 Not Found
  ```

- [ ] **Test 9.3**: Anonymous user can access published forms
  ```bash
  curl http://localhost:3000/api/forms/{published-form-id}
  # Expected: 200 OK, form returned
  ```

- [ ] **Test 9.4**: Anonymous user CANNOT access drafts
  ```bash
  curl http://localhost:3000/api/forms/{draft-form-id}
  # Expected: 404 Not Found
  ```

### 5. UI/UX Tests

#### Form Builder
- [ ] **Test 10.1**: User can create a new form
- [ ] **Test 10.2**: User can edit their own form
- [ ] **Test 10.3**: User cannot edit forms via direct URL manipulation
- [ ] **Test 10.4**: Image uploads work correctly
- [ ] **Test 10.5**: Published forms are publicly accessible

#### Form Submissions
- [ ] **Test 11.1**: Anonymous user can submit to published form
- [ ] **Test 11.2**: Submission appears in form owner's dashboard
- [ ] **Test 11.3**: Submitter CANNOT view others' submissions

#### Dashboard
- [ ] **Test 12.1**: User sees only their own forms
- [ ] **Test 12.2**: User sees only submissions to their forms
- [ ] **Test 12.3**: Analytics show correct data

### 6. Performance Tests

- [ ] **Test 13.1**: Page load times unchanged (<100ms degradation)
- [ ] **Test 13.2**: Database query performance acceptable
- [ ] **Test 13.3**: No N+1 query issues introduced

## Staging Environment Testing

Repeat all Dev Environment tests on staging with production-like data:

- [ ] All RLS policy tests pass
- [ ] All storage policy tests pass
- [ ] All RPC function tests pass
- [ ] All API route tests pass
- [ ] All UI/UX tests pass
- [ ] Performance acceptable under load

## Production Deployment

### Pre-Deployment
- [ ] All staging tests passed
- [ ] Database backup verified
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

### Deployment Steps
1. [ ] Put application in maintenance mode (optional)
2. [ ] Run migration: `20250123_rls_policies_core_tables.sql`
3. [ ] Verify no errors in Supabase logs
4. [ ] Run migration: `20250123_storage_public_read.sql`
5. [ ] Verify no errors in Supabase logs
6. [ ] Run migration: `20250123_rpc_function_hardening.sql`
7. [ ] Verify no errors in Supabase logs
8. [ ] Take application out of maintenance mode

### Post-Deployment Smoke Tests
- [ ] **Test 14.1**: Login works
- [ ] **Test 14.2**: Can view dashboard
- [ ] **Test 14.3**: Can create a form
- [ ] **Test 14.4**: Published form is publicly accessible
- [ ] **Test 14.5**: Anonymous user can submit
- [ ] **Test 14.6**: Submission appears in dashboard
- [ ] **Test 14.7**: Image upload works
- [ ] **Test 14.8**: No console errors in browser
- [ ] **Test 14.9**: No 5xx errors in logs
- [ ] **Test 14.10**: Response times acceptable

### Production Validation (Critical Tests Only)
- [ ] **Prod Test 1**: Create test form as User A
- [ ] **Prod Test 2**: Attempt to access User A's draft as User B (should fail)
- [ ] **Prod Test 3**: Publish form, verify public access
- [ ] **Prod Test 4**: Submit as anonymous, verify in dashboard
- [ ] **Prod Test 5**: Upload image, verify public URL works
- [ ] **Prod Test 6**: Check error logs for RLS violations
- [ ] **Prod Test 7**: Monitor for 5 minutes, verify no spike in errors

## Rollback Procedure

If issues are detected:

1. [ ] Put application in maintenance mode
2. [ ] Run rollback migrations (if available) or restore from backup
3. [ ] Verify application functionality restored
4. [ ] Document issue and plan fix
5. [ ] Take application out of maintenance mode

### Rollback Migrations

If needed, create reverse migrations:

```sql
-- Rollback RLS policies
DROP POLICY "Users can view their own forms" ON forms;
-- ... drop all policies ...

-- Rollback storage policies
DROP POLICY "Public can read form assets" ON storage.objects;
-- Recreate old policy if needed

-- Rollback RPC hardening
GRANT EXECUTE ON FUNCTION schema_cache_reload() TO authenticated;
```

## Monitoring Post-Deployment

Monitor for 24 hours after production deployment:

- [ ] Error rates (should be <0.1%)
- [ ] Response times (should be <500ms p95)
- [ ] RLS violation attempts (check Supabase logs)
- [ ] User complaints/support tickets
- [ ] Form submission success rate

## Sign-Off

### Development
- [ ] Tested by: _______________ Date: ___/___/___
- [ ] Approved by: _______________ Date: ___/___/___

### Staging
- [ ] Tested by: _______________ Date: ___/___/___
- [ ] Approved by: _______________ Date: ___/___/___

### Production
- [ ] Deployed by: _______________ Date: ___/___/___
- [ ] Verified by: _______________ Date: ___/___/___
- [ ] No issues after 24h: _______________ Date: ___/___/___

