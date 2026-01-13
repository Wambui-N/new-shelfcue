# Trial System Documentation

## Overview

ShelfCue automatically provides all new users with a **14-day free trial** of the Professional plan. During this period, users have full access to create forms, collect submissions, and use all premium features.

## How It Works

### 1. User Signup Flow

When a new user signs up (`/auth/welcome`):

1. The welcome page fetches the "professional" plan from `subscription_plans` table
2. It calls `/api/subscriptions/create-trial` to create a trial subscription
3. A new row is inserted into `user_subscriptions` with:
   - `status: "trial"`
   - `trial_start: now`
   - `trial_end: now + 14 days`
   - `current_period_start: now`
   - `current_period_end: trial_end`

### 2. Access Control

The `getUserLimits()` function in `src/lib/subscriptionLimits.ts` determines what features a user can access:

```typescript
// For active trials (status="trial" AND trial_end > now)
// → Returns full plan limits (create forms, submissions, etc.)

// For expired trials (status="trial" AND trial_end < now)
// → Returns zero limits (no access)

// For expired/cancelled subscriptions
// → Returns zero limits (no access)
```

### 3. Form Creation Enforcement

When a user tries to create a form (`/editor/new`):

1. **Subscription Check**: Verify trial hasn't expired
   - If expired: Redirect to `/dashboard/billing`
   
2. **Limit Check**: Call `/api/forms/check-limit` which uses `canPerformAction()`
   - If form limit reached: Redirect to `/dashboard/billing`
   
3. **Form Creation**: If checks pass, allow form creation

### 4. After Trial Expires

Once the 14-day trial period ends:

- `getUserLimits()` returns zero limits for all resources
- User is blocked from creating new forms
- Existing forms remain published but user can't edit or create new ones
- User is prompted to subscribe on `/dashboard/billing`

## Key Files

### API Routes

- **`/api/subscriptions/create-trial`**: Creates trial subscription for new users
- **`/api/subscriptions/current`**: Returns current subscription status
- **`/api/forms/check-limit`**: Checks if user can create more forms

### Components

- **`src/app/auth/welcome/page.tsx`**: Welcome page that creates trial subscription
- **`src/app/editor/new/page.tsx`**: Form creation page with trial/limit checks
- **`src/lib/subscriptionLimits.ts`**: Core logic for access control and limits

### Database Tables

- **`user_subscriptions`**: Stores subscription data including trial dates
  - `status`: "trial" | "active" | "expired" | "cancelled"
  - `trial_start`: Trial start date
  - `trial_end`: Trial end date
  
- **`subscription_plans`**: Available plans (starter, professional, enterprise)
  - Each plan has a `limits` JSONB field with form/submission/storage limits

## Trial Features

During the 14-day trial, users get access to:

✅ Create unlimited forms (based on Professional plan limits)
✅ Unlimited submissions per month
✅ Custom branding (logo, colors, backgrounds)
✅ Google Sheets integration
✅ Google Calendar meeting scheduling
✅ Form analytics
✅ Custom domains/embeds

## Testing

### Verify Trial Creation

1. Create a new user account
2. Check `user_subscriptions` table for a row with:
   - `status = "trial"`
   - `trial_end` is 14 days from now
3. Navigate to `/editor/new` - should allow form creation

### Verify Trial Expiry

1. Manually update a trial subscription:
   ```sql
   UPDATE user_subscriptions
   SET trial_end = NOW() - INTERVAL '1 day'
   WHERE user_id = 'YOUR_USER_ID';
   ```
2. Try to create a new form at `/editor/new`
3. Should see alert: "Your trial has expired. Please subscribe to create new forms."
4. Should redirect to `/dashboard/billing`

## Troubleshooting

### User Can't Create Forms After Signup

Check:
1. Does user have a `user_subscriptions` row?
2. Is `status = "trial"`?
3. Is `trial_end` in the future?
4. Check browser console for API errors
5. Check server logs for trial creation errors

### Trial Not Created on Signup

Check:
1. Browser console for fetch errors in `/auth/welcome`
2. Server logs for errors in `/api/subscriptions/create-trial`
3. Verify "professional" plan exists in `subscription_plans` table
4. Verify RLS policies allow inserting into `user_subscriptions`

## Payment Integration

When a user's trial expires and they want to continue:

1. They visit `/dashboard/billing`
2. Select a plan and payment method (Paystack)
3. Complete payment through Paystack
4. `/api/payments/verify` updates their subscription:
   - `status: "trial"` → `status: "active"`
   - Sets new `current_period_end` based on billing cycle

## Security

- Trial subscriptions are created server-side only (no client manipulation)
- RLS policies ensure users can only access their own subscriptions
- API endpoints verify authentication before checking limits
- Trial expiry checks happen on both client and server side

## Future Improvements

- [ ] Email notifications when trial is about to expire (3 days, 1 day before)
- [ ] Grace period after trial expires (1-2 days)
- [ ] Option to extend trial for specific users (admin panel)
- [ ] Analytics dashboard showing trial conversion rates

