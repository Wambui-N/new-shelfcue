# Quick Start Guide - Email Notifications

This is a quick reference for getting email notifications working in ShelfCue.

## 5-Minute Setup

### 1. Get Resend API Key
1. Go to [resend.com/signup](https://resend.com/signup)
2. Sign up and verify your email
3. Navigate to **API Keys** → **Create API Key**
4. Copy your API key

### 2. Add to Environment Variables
Add these two lines to your `.env.local`:

```bash
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL="ShelfCue <onboarding@resend.dev>"
```

### 3. Restart Your Server
```bash
# Stop your server (Ctrl+C)
npm run dev
```

That's it! Email notifications are now active.

## What Emails Get Sent?

| Event | Recipient | Email Type |
|-------|-----------|------------|
| User signs up | New user | Welcome email |
| Form submitted | Form owner | Submission notification with details |
| Subscription starts | Subscriber | Confirmation with plan details |
| Payment fails | User | Payment failed alert |
| Invoice created | User | Invoice notification |
| Subscription cancelled | User | Cancellation confirmation |

## Testing

### Test Welcome Email
1. Sign up for a new account
2. Complete the signup process
3. Check email inbox

### Test Form Submission Email
1. Create and publish a form
2. Submit the form (can use your own form)
3. Check the form owner's email

## Development vs Production

**Development (no domain needed):**
```bash
RESEND_FROM_EMAIL="ShelfCue <onboarding@resend.dev>"
```

**Production (requires verified domain):**
```bash
RESEND_FROM_EMAIL="ShelfCue <noreply@yourdomain.com>"
```

To verify a domain, see the full guide in `RESEND_SETUP.md`.

## Troubleshooting

**Emails not sending?**
- Check API key is correct
- Restart dev server after adding env vars
- Check console for error messages

**Need more help?**
- See `RESEND_SETUP.md` for detailed documentation
- Check Resend dashboard logs at [resend.com/logs](https://resend.com/logs)

## Code Files

If you need to customize emails, check these files:
- `src/lib/resend.ts` - Email service and templates
- `src/app/api/submit/route.ts` - Form submission emails
- `src/app/api/webhooks/paystack/route.ts` - Billing emails
- `src/app/api/auth/welcome-email/route.ts` - Welcome email API

---

For complete documentation, see `RESEND_SETUP.md`

