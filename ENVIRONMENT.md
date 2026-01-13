# Environment Variables Guide

This document provides guidance on setting up and securing environment variables for the ShelfCue application.

## Quick Setup

1. Create `.env.local` in the project root (gitignored)
2. Copy variables from the template below
3. Fill in your actual values
4. Never commit `.env.local` to version control

## Environment Variables Template

```bash
# ============================================================
# PUBLIC ENVIRONMENT VARIABLES (Safe to expose to client)
# ============================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your-paystack-public-key

# ============================================================
# PRIVATE ENVIRONMENT VARIABLES (Backend only - NEVER expose)
# ============================================================
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
GOOGLE_CLIENT_SECRET=your-google-client-secret
PAYSTACK_SECRET_KEY=sk_test_your-paystack-secret-key

# ============================================================
# OPTIONAL
# ============================================================
NODE_ENV=development
```

## Variable Descriptions

### Public Variables (NEXT_PUBLIC_*)

These variables are bundled into the client-side JavaScript and are safe to expose:

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side database key (RLS enforced) | `eyJ...` |
| `NEXT_PUBLIC_APP_URL` | Application base URL | `https://app.shelfcue.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | `123...apps.googleusercontent.com` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack publishable key | `pk_live_...` or `pk_test_...` |

### Private Variables (Backend Only)

These variables provide elevated access and must NEVER be exposed to the client:

| Variable | Purpose | Security Level |
|----------|---------|----------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS, full database access | 🔴 CRITICAL |
| `GOOGLE_CLIENT_SECRET` | Google OAuth authentication | 🔴 CRITICAL |
| `PAYSTACK_SECRET_KEY` | Payment processing | 🔴 CRITICAL |

## Security Best Practices

### 1. Never Commit Secrets

```bash
# .gitignore should contain:
.env.local
.env*.local
.env.production
```

### 2. Use Different Keys Per Environment

```
Development:  pk_test_..., sk_test_...
Staging:      pk_staging_..., sk_staging_...
Production:   pk_live_..., sk_live_...
```

### 3. Service Role Key Usage

**✅ CORRECT Usage (API Routes)**
```typescript
// app/api/forms/route.ts
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = getSupabaseAdmin(); // Uses service role key
  // Always validate user permissions manually!
  // ...
}
```

**❌ INCORRECT Usage (Client Components)**
```typescript
// components/MyComponent.tsx - NEVER DO THIS!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // WRONG! Exposed to client!
);
```

### 4. Key Rotation Schedule

- **Service Role Key**: Every 90 days or immediately if compromised
- **OAuth Secrets**: Immediately if compromised
- **Payment Keys**: Immediately if compromised
- **Anon Key**: Rarely (requires database regeneration)

### 5. Access Control

| Environment | Who Has Access | Key Type |
|-------------|----------------|----------|
| Development | All developers | Test keys only |
| Staging | Core team | Staging keys |
| Production | DevOps + 1-2 admins | Production keys |

## Vercel Deployment

### Adding Environment Variables

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add each variable individually
3. Select appropriate environment(s):
   - **Production**: Live site secrets
   - **Preview**: PR deployments (use staging keys)
   - **Development**: Local dev (use test keys)

### via Vercel CLI

```bash
# Public variables (all environments)
vercel env add NEXT_PUBLIC_SUPABASE_URL

# Secrets (production only)
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add PAYSTACK_SECRET_KEY production
```

## Supabase Configuration

### Getting Your Keys

1. Go to Supabase Dashboard → Project Settings → API
2. Copy values:
   - **URL**: Project URL
   - **anon/public**: Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role**: Use as `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Service Role Key**: Only visible once. Store securely (1Password, etc.)

### Row Level Security (RLS)

The anon key is safe to expose because:
- All tables have RLS enabled
- Policies restrict access to user's own data
- Cannot access other users' drafts or submissions
- Cannot perform administrative operations

The service role key bypasses RLS, so:
- Never use in client code
- Always validate permissions in API routes
- Treat like a root password

## Google OAuth Setup

### Getting Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   ```
   https://{your-project}.supabase.co/auth/v1/callback
   https://app.shelfcue.com/api/auth/google-server-callback
   ```

### Environment Variables

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Client ID (public)
- `GOOGLE_CLIENT_SECRET`: Client secret (private)

## Paystack Setup

### Getting Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Settings → API Keys & Webhooks
3. Copy keys:
   - **Public Key**: `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - **Secret Key**: `PAYSTACK_SECRET_KEY`

### Test vs Live

- **Test Keys** (`pk_test_`, `sk_test_`): Development/staging
- **Live Keys** (`pk_live_`, `sk_live_`): Production only

## Troubleshooting

### "Unauthorized" errors in API

**Problem**: Service role key not set or incorrect

**Solution**:
```bash
# Check if .env.local exists
ls -la .env.local

# Verify service role key is set
grep SUPABASE_SERVICE_ROLE_KEY .env.local

# Restart dev server
npm run dev
```

### OAuth redirect mismatch

**Problem**: Redirect URL doesn't match Google Console config

**Solution**:
1. Check `NEXT_PUBLIC_APP_URL` in `.env.local`
2. Verify it matches redirect URIs in Google Console
3. Update Google Console if deploying to new domain

### RLS policy errors

**Problem**: Client trying to access unauthorized data

**Solution**:
- Check that user is authenticated
- Verify user owns the resource
- Review RLS policies in Supabase Dashboard

### Storage upload failures

**Problem**: Form assets bucket not configured

**Solution**:
1. Create `form-assets` bucket in Supabase Dashboard
2. Set to public
3. Run storage migration: `20250123_storage_public_read.sql`

## Environment Checklist

Before deploying to a new environment:

- [ ] All required variables set
- [ ] Correct keys for environment (test/staging/prod)
- [ ] Service role key secured (not committed)
- [ ] OAuth redirect URLs configured
- [ ] Paystack webhook URL set (if applicable)
- [ ] Test authentication flow
- [ ] Test form submission
- [ ] Test file upload
- [ ] Verify RLS policies active

## Additional Resources

- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

