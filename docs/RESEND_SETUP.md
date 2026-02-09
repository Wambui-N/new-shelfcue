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

## 4. What gets sent

- **Welcome** – once when a new user’s trial is created.
- **Trial reminder** – once at ~7 days into trial.
- **Trial ending soon** – once ~2 days before trial end.
- **Trial expired** – once when the trial is marked expired.
- **Form submission** – per submission to the form owner.
- **Subscription / invoice / payment failed** – via Paystack webhooks.

See the main app docs and `src/lib/resend.ts` for the full list of templates.
