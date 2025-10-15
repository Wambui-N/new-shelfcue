# Environment Variables Template

Copy this to `.env.local` and fill in your actual values.

```bash
# ============================================
# Supabase Configuration
# ============================================
# Get these from your Supabase project settings
# https://app.supabase.com/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key


# ============================================
# Google OAuth Configuration
# ============================================
# Create OAuth credentials at:
# https://console.cloud.google.com/apis/credentials
# Enable Google Calendar API and Google Sheets API

NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret


# ============================================
# Paystack Configuration
# ============================================
# Get your API keys from:
# https://dashboard.paystack.com/#/settings/developers

NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key


# ============================================
# Resend Email Configuration
# ============================================
# Get your API key from:
# https://resend.com/api-keys
# See RESEND_SETUP.md for detailed setup instructions

RESEND_API_KEY=re_your_resend_api_key
# For development, use: "ShelfCue <onboarding@resend.dev>"
# For production, use your verified domain: "ShelfCue <noreply@shelfcue.com>"
RESEND_FROM_EMAIL="ShelfCue <onboarding@resend.dev>"


# ============================================
# App Configuration
# ============================================
# Your application URL (used for OAuth callbacks and email links)
# Development: http://localhost:3000
# Production: https://yourdomain.com

NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Quick Setup Checklist

- [ ] Create a Supabase project and get API keys
- [ ] Set up Google OAuth credentials
- [ ] Enable Google Calendar and Sheets APIs
- [ ] Create a Paystack account and get API keys
- [ ] Sign up for Resend and get an API key
- [ ] Copy this template to `.env.local`
- [ ] Fill in all the values
- [ ] Restart your development server

## Need Help?

- **Supabase Setup:** Check Supabase documentation
- **Google OAuth:** See Google Cloud Console documentation
- **Paystack Setup:** Visit Paystack documentation
- **Resend Setup:** See `RESEND_SETUP.md` for detailed instructions

## Security Notes

⚠️ **NEVER commit `.env.local` to version control!**

- Keep your API keys secret
- Use test keys for development
- Use production keys only in production
- Rotate keys if they are ever exposed

