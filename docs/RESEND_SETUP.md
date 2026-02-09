# Resend Setup

ShelfCue uses [Resend](https://resend.com) for transactional email (welcome, trial reminders, form submissions, billing).

## 1. Sign up and API key

1. Sign up at [resend.com/signup](https://resend.com/signup).
2. In the Resend dashboard, go to **API Keys** and create a key.
3. Add to your environment (e.g. `.env.local`):

   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```

## 2. From address and domain verification

Emails are sent from the address in `RESEND_FROM_EMAIL`. If not set, the app uses:

- `ShelfCue <noreply@shelfcue.com>`

For deliverability (and to avoid spam), the **domain** in that address must be verified in Resend:

1. In Resend dashboard go to **Domains**.
2. Add your domain (e.g. `shelfcue.com`) and add the DNS records Resend provides.
3. Wait until the domain shows as verified.

To use a different from address (e.g. for testing with Resend’s onboarding domain):

```env
RESEND_FROM_EMAIL="ShelfCue <onboarding@resend.dev>"
```

Use a verified domain or Resend’s test domain so sends don’t fail.

## 3. Environment variables

| Variable           | Required | Description                                      |
| ----------------- | -------- | ------------------------------------------------ |
| `RESEND_API_KEY`  | Yes      | API key from Resend dashboard.                   |
| `RESEND_FROM_EMAIL` | No     | From address. Default: `ShelfCue <noreply@shelfcue.com>`. |

## 4. Database (welcome email)

The welcome email is sent at most once per user. Run this migration so the app can record that:

- **Supabase SQL Editor:** run `supabase/migrations/profiles_welcome_email_sent_at.sql` (adds `profiles.welcome_email_sent_at`).

## 5. What gets sent

- **Welcome** – once when a new user’s trial is created.
- **Trial reminder** – once at ~7 days into trial.
- **Trial ending soon** – once ~2 days before trial end.
- **Trial expired** – once when the trial is marked expired.
- **Form submission** – per submission to the form owner.
- **Subscription / invoice / payment failed** – via Paystack webhooks.

See the main app docs and `src/lib/resend.ts` for the full list of templates.

## 6. Testing emails

### Welcome email

1. Run the app (`npm run dev`).
2. Sign out if needed, then sign up with a **new** Google account (or an account that has no subscription yet).
3. Complete the flow until the welcome page creates your trial (redirect to dashboard).
4. Check the inbox for that account; you should get “Welcome to ShelfCue!”.

To test without a full signup: call the create-trial API for a user who has no subscription (e.g. from a tool like Postman), with a valid Bearer token for that user. The welcome email is sent only when a **new** trial is created.

### Form submission email

1. Log in, create a form, and publish it.
2. Open the form’s public submit URL in another tab or incognito and submit once.
3. The email on the form owner’s profile should receive “New Form Submission: &lt;form name&gt;”.

### Trial reminder / ending soon / expired (cron)

These are sent by the **cron** route. You need the `trial_email_sent` table (run `supabase/migrations/trial_email_sent.sql` if you haven’t).

**Option A – Call the cron manually**

1. Set `CRON_SECRET` in `.env.local` (e.g. `CRON_SECRET=test-secret-123`).
2. Restart the dev server.
3. Call the endpoint (replace with your base URL and secret):

   ```bash
   curl -X GET "http://localhost:3000/api/cron/trial-emails" -H "Authorization: Bearer test-secret-123"
   ```

   Or with the header name the route supports:

   ```bash
   curl -X GET "http://localhost:3000/api/cron/trial-emails" -H "x-cron-secret: test-secret-123"
   ```

4. The response is JSON with counts, e.g. `{"ok":true,"sent":{"trial_reminder":0,"trial_ending_soon":0,"trial_expired":0}}`. Emails are only sent if there are users in the right windows (see below).

**Option B – Create test data so the cron has something to send**

Use the Supabase SQL Editor (or Table Editor) so that at least one subscription matches the cron logic:

- **Trial reminder:** `status = 'trial'` and `trial_end` between **6.5 and 7.5 days** from now.
- **Trial ending soon:** `status = 'trial'` and `trial_end` between **1.5 and 2.5 days** from now.
- **Trial expired:** `status = 'expired'` and `updated_at` within the **last 24 hours**.

Example for a **trial reminder** (replace `USER_ID` with a real user id and ensure that user has a row in `profiles` with a valid email):

```sql
-- Set one trial to end in 7 days so the cron sends "trial reminder"
update user_subscriptions
set trial_end = now() + interval '7 days', trial_start = now() - interval '7 days'
where user_id = 'USER_ID' and status = 'trial';
```

Then call the cron (Option A). Check the inbox for that user’s email. The cron will insert into `trial_email_sent`, so that user won’t get the same email again on the next run.

**Resend dashboard:** In Resend, go to **Logs** (or **Emails**) to see sent emails, status, and any errors.
