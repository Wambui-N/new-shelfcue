# Paystack Payment Integration Setup Guide

## Overview

ShelfCue now has a complete Paystack payment integration with a **14-day free trial** for all new users. There is no free plan - only a Professional plan with trial access.

## Features

- ✅ 14-day free trial for all new signups
- ✅ Automated trial subscription creation
- ✅ Seamless payment flow via Paystack
- ✅ Subscription management and card updates
- ✅ Usage limits enforcement
- ✅ Trial expiry notifications
- ✅ Webhook handlers for subscription lifecycle
- ✅ Invoice tracking and payment history

## Step 1: Create Paystack Account

1. Go to [https://paystack.com](https://paystack.com)
2. Sign up for a Paystack account
3. Complete business verification (required for live mode)

## Step 2: Get API Keys

### Test Keys (for development)
1. Log in to Paystack Dashboard
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Test Public Key** and **Test Secret Key**

### Live Keys (for production)
1. Complete business verification
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Live Public Key** and **Live Secret Key**

## Step 3: Create Subscription Plan on Paystack

1. Go to **Payments** → **Plans** in Paystack Dashboard
2. Click **Create Plan**
3. Fill in plan details:
   - **Plan Name**: Professional
   - **Amount**: 2900 ($29.00 in kobo)
   - **Interval**: Monthly
   - **Send invoices**: Yes
   - **Invoice limit**: 0 (unlimited)
4. Click **Create Plan**
5. Copy the **Plan Code** (looks like `PLN_xxxxxxxxxx`)

## Step 4: Set Up Environment Variables

Add these to your `.env.local` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=your-webhook-secret-here

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: In production, replace with live keys and your production URL.

## Step 5: Configure Webhook

1. Go to **Settings** → **API Keys & Webhooks** in Paystack Dashboard
2. Scroll to **Webhooks** section
3. Click **Add Webhook URL**
4. Enter: `https://yourdomain.com/api/webhooks/paystack`
   - For local testing: Use ngrok or similar tunnel service
5. Set **Webhook Secret** (copy this to your `.env.local` as `PAYSTACK_WEBHOOK_SECRET`)
6. Select events to listen to:
   - ✅ charge.success
   - ✅ subscription.create
   - ✅ subscription.disable
   - ✅ subscription.not_renew
   - ✅ invoice.create
   - ✅ invoice.update
   - ✅ invoice.payment_failed

## Step 6: Run Database Migrations

Run the subscription schema migration:

```bash
# In Supabase SQL Editor, run:
# create-subscriptions-schema.sql
```

This will:
- Create subscription_plans table with Professional plan
- Create user_subscriptions table
- Create payment_authorizations table
- Create invoices table
- Create payment_transactions table
- Create usage_tracking table
- Set up RLS policies
- Create trigger to auto-create trial subscriptions for new users

## Step 7: Update Plan Code in Database

After creating the plan on Paystack Dashboard, update your database:

```sql
UPDATE subscription_plans 
SET paystack_plan_code = 'PLN_xxxxxxxxxx'  -- Your plan code from Paystack
WHERE name = 'professional';
```

## Step 8: Test the Integration

### 1. Test Trial Signup
1. Create a new account
2. Verify you get 14-day trial automatically
3. Check that trial banner appears in dashboard

### 2. Test Payment Flow
1. Click "Subscribe Now" in billing page
2. Use Paystack test cards:
   - **Success**: `4084084084084081`
   - **Insufficient Funds**: `5060666666666666666`
   - Any CVV and future expiry date
3. Complete payment
4. Verify redirect to verification page
5. Check subscription status is "active"

### 3. Test Webhooks (Local Development)
```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Use the ngrok URL in Paystack webhook settings
https://xxxx-xx-xx-xx-xx.ngrok.io/api/webhooks/paystack
```

### 4. Test Trial Expiry
Manually update trial_end in database to test expiry:

```sql
UPDATE user_subscriptions 
SET trial_end = NOW() - INTERVAL '1 day'
WHERE user_id = 'your-user-id';
```

## Pricing Structure

### Professional Plan
- **Price**: $29/month ($290/year)
- **Trial**: 14 days free
- **Features**:
  - ✅ Unlimited forms
  - ✅ Unlimited leads/month
  - ✅ Google Sheets integration
  - ✅ Google Calendar integration
  - ✅ Meeting booking
  - ✅ Advanced analytics
  - ✅ Priority support
  - ✅ Custom branding
  - ✅ Email notifications

## Key Files Created

### Database Schema
- `create-subscriptions-schema.sql` - Complete subscription database schema

### API Routes
- `src/app/api/payments/initialize/route.ts` - Initialize Paystack transaction
- `src/app/api/payments/verify/route.ts` - Verify payment and activate subscription
- `src/app/api/webhooks/paystack/route.ts` - Handle Paystack webhook events
- `src/app/api/subscriptions/current/route.ts` - Get user's current subscription
- `src/app/api/subscriptions/plans/route.ts` - Get available plans
- `src/app/api/forms/check-limit/route.ts` - Check if user can create forms

### Libraries
- `src/lib/paystack.ts` - Paystack API client and utilities
- `src/lib/subscriptionLimits.ts` - Subscription limits enforcement

### Components
- `src/components/subscriptions/UpgradePrompt.tsx` - Upgrade prompt component
- `src/components/subscriptions/TrialBanner.tsx` - Trial status banner
- `src/app/dashboard/billing/page.tsx` - Billing and subscription page
- `src/app/dashboard/billing/verify/page.tsx` - Payment verification page

### Hooks
- `src/hooks/useSubscription.ts` - React hook for subscription data

## Subscription Statuses

- **trial**: User is in 14-day trial period
- **active**: User has paid subscription
- **expired**: Trial or subscription has expired
- **cancelled**: User cancelled subscription

## Usage Tracking

The system automatically tracks:
- Forms created
- Submissions received per month
- Storage used (MB)
- API calls made

Limits are enforced in real-time via the `canPerformAction()` function.

## Trial to Paid Conversion Flow

1. User signs up → Automatic 14-day trial
2. Trial banner shows days remaining (when ≤ 7 days)
3. User clicks "Subscribe Now"
4. Redirects to Paystack payment page
5. User enters card details
6. Paystack redirects to `/dashboard/billing/verify?reference=xxx`
7. System verifies payment
8. Updates subscription status to "active"
9. Stores payment authorization for future charges
10. User has full access

## Subscription Management

Users can manage their subscription via Paystack's hosted page:

```
https://paystack.com/subscription/manage/{email_token}
```

This allows them to:
- Update payment card
- Cancel subscription
- View payment history

## Important Notes

1. **Test Mode**: Use test keys for development
2. **Live Mode**: Only use live keys in production after business verification
3. **Webhook Security**: Always verify webhook signatures
4. **Error Handling**: All payment errors are logged and user-friendly messages shown
5. **Currency**: Currently set to NGN (Nigerian Naira) - update in code if needed

## Production Checklist

- [ ] Business verified on Paystack
- [ ] Live API keys configured
- [ ] Production webhook URL set
- [ ] Plan created with correct pricing
- [ ] Database migrations run on production
- [ ] Test complete payment flow
- [ ] Test webhook delivery
- [ ] Monitor Paystack dashboard for transactions

## Support

For Paystack-specific issues:
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Support](https://paystack.com/support)

For integration issues:
- Check Paystack Dashboard → Logs
- Check application logs for errors
- Verify webhook signature validation

