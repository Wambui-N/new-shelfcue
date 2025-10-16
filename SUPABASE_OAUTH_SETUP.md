# Supabase OAuth Configuration Guide

## Current Issue
Getting `oauth_error` with no description when trying to sign in with Google.

## Required Supabase Settings

### 1. Supabase Dashboard → Authentication → URL Configuration

**Site URL:**
```
https://www.shelfcue.com
```

**Redirect URLs (Add all of these):**
```
https://www.shelfcue.com/*
https://www.shelfcue.com/auth/callback
https://www.shelfcue.com/api/auth/google-server-callback
http://localhost:3000/*
http://localhost:3000/auth/callback
```

### 2. Supabase Dashboard → Authentication → Providers → Google

**Enabled:** ✅ Yes

**Client ID (for OAuth):**
```
[Your Google Client ID]
```

**Client Secret (for OAuth):**
```
[Your Google Client Secret]
```

**Authorized Client IDs:** (Leave empty unless using native apps)

**Skip nonce check:** ❌ No (keep unchecked)

### 3. Google Cloud Console → APIs & Services → Credentials

**Authorized JavaScript origins:**
```
https://www.shelfcue.com
http://localhost:3000
https://[YOUR-PROJECT-REF].supabase.co
```

**Authorized redirect URIs (CRITICAL - Only these):**
```
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
http://localhost:54321/auth/v1/callback
```

**Important:** 
- DO NOT add `https://www.shelfcue.com/auth/callback` to Google Cloud Console
- DO NOT add `https://www.shelfcue.com/api/auth/google-server-callback` to Google Cloud Console
- Those are for Supabase's redirect configuration, NOT Google's

### 4. Environment Variables (Vercel)

Required environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
NEXT_PUBLIC_APP_URL=https://www.shelfcue.com
```

## Testing

After configuring:

1. **Check configuration:**
   ```
   https://www.shelfcue.com/api/check-supabase-config
   ```

2. **Test OAuth flow:**
   - Clear browser cache and cookies
   - Go to https://www.shelfcue.com/auth/signin
   - Click "Sign in with Google"
   - Check browser console for detailed logs

3. **If still failing, check:**
   - Supabase Logs Dashboard for detailed error messages
   - Browser Network tab to see the actual redirect URLs
   - Ensure all environment variables are set in Vercel

## Common Issues

### Issue: `oauth_error` with no description
**Cause:** Redirect URI mismatch or Supabase configuration issue
**Solution:** 
- Verify Site URL in Supabase matches exactly `https://www.shelfcue.com`
- Verify Google Cloud Console redirect URIs include ONLY Supabase callback URL
- Check Supabase logs for more details

### Issue: `Unable to exchange external code`
**Cause:** Google Client Secret mismatch
**Solution:** 
- Ensure Google Client Secret in Supabase matches the one in Google Cloud Console
- Regenerate client secret if needed and update both places

### Issue: Tokens not being stored
**Cause:** Database schema or RLS policy issues
**Solution:**
- Run diagnostics: `https://www.shelfcue.com/api/diagnose-oauth?userId=[USER_ID]`
- Check RLS policies on `user_google_tokens` table allow service role to insert

## Current OAuth Flow

1. User clicks "Sign in with Google" → `AuthContext.signInWithGoogle()`
2. Supabase redirects to Google OAuth
3. User authorizes on Google
4. Google redirects to: `https://[PROJECT].supabase.co/auth/v1/callback`
5. Supabase processes the callback and redirects to: `https://www.shelfcue.com/auth/callback`
6. Our app's callback page (`/auth/callback`) stores tokens and redirects to dashboard

## Debugging Steps

1. Check Supabase Dashboard → Logs → Auth for error details
2. Use `/api/check-supabase-config` to verify configuration
3. Use `/api/diagnose-oauth?userId=XXX` to check token storage
4. Clear all browser data and try fresh
5. Test in incognito mode

