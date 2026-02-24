# Supabase setup for ShelfCue

Use this checklist to ensure your Supabase project has the schema and env the app expects for auth, subscriptions, and payments.

## Environment variables

In your app (e.g. Vercel / `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` – project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon/public key (client)
- `SUPABASE_SERVICE_ROLE_KEY` – service role key (server-only; API routes, webhooks)

Never expose the service role key to the client.

## Tables the app uses

### 1. `subscription_plans`

Used by `/api/subscriptions/plans`, billing UI, and trial/payment flows.

| Column            | Type    | Notes                                      |
|-------------------|---------|--------------------------------------------|
| id                | uuid    | PK                                         |
| name              | text    | e.g. `"professional"`                      |
| display_name      | text    | e.g. `"Professional"`                     |
| description       | text    | optional                                   |
| price_monthly     | number  | e.g. 8                                     |
| is_active         | boolean | filter active plans                        |
| features          | jsonb   | optional array/object                       |
| paystack_plan_code| text    | **Required for payments** – Paystack plan  |
| created_at        | timestamptz | optional                               |
| updated_at        | timestamptz | optional                               |

Ensure at least one row with `name = 'professional'` and a valid `paystack_plan_code` from your Paystack dashboard.

### 2. `user_subscriptions`

Used by `/api/subscriptions/current`, create-trial, create-my-trial, payments verify, webhooks.

| Column                    | Type    | Notes                                  |
|---------------------------|---------|----------------------------------------|
| id                        | uuid    | PK                                     |
| user_id                   | uuid    | FK → auth.users                        |
| plan_id                   | uuid    | FK → subscription_plans.id             |
| status                    | text    | `trial` \| `active` \| `expired` \| `cancelled` \| `inactive` |
| trial_start               | timestamptz | nullable; set for trials           |
| trial_end                 | timestamptz | nullable; set for trials             |
| current_period_start      | timestamptz | nullable                           |
| current_period_end        | timestamptz | nullable                           |
| billing_cycle             | text    | e.g. `"monthly"`                       |
| paystack_subscription_code| text    | nullable; set by Paystack webhooks      |
| cancel_at_period_end      | boolean | optional                               |
| is_trial                  | boolean | optional                               |
| created_at, updated_at    | timestamptz | optional                            |

RLS: service role (and any server-side client) needs full access; restrict client access as needed.

### 3. `payment_transactions`

Used by `/api/payments/initialize` and `/api/payments/verify`.

Columns used: `user_id`, `paystack_reference`, `amount`, `currency`, `status`, `metadata`, `paystack_transaction_id`, `paid_at`, `subscription_id`, etc. (see `src/lib/supabase/database.types.ts` for full shape.)

### 4. `subscription_cancellations`

Used by the billing page when the user cancels.

| Column           | Type  | Notes        |
|------------------|-------|--------------|
| id               | uuid  | PK           |
| user_id          | uuid  | FK → users   |
| subscription_id  | uuid  | FK → user_subscriptions |
| reason           | text  |              |
| feedback         | text  | optional     |
| created_at       | timestamptz | optional |

## Regenerating TypeScript types

After changing the schema in Supabase, regenerate types so `src/lib/supabase/database.types.ts` stays in sync:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/lib/supabase/database.types.ts
```

Get `YOUR_PROJECT_REF` from the Supabase dashboard URL or project settings. If you don’t use the CLI, you can copy the types from the Supabase dashboard (Settings → API → “Generate types”) into `database.types.ts`.

## Paystack ↔ Supabase

- **Trials:** Created in Supabase only (`create-trial` / `create-my-trial`); no Paystack subscription yet.
- **Paid:** Payment is initialized → user pays on Paystack → `/api/payments/verify` (or webhooks) create/update `user_subscriptions` and `payment_transactions` in Supabase.

Ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in the environment where API routes and webhooks run (e.g. Vercel), or payment verification and subscription updates will fail.

## Trial Expiration (Automated)

The app automatically expires trial subscriptions after 14 days and unpublishes forms. This requires running a SQL migration in your Supabase project.

**Setup:**
1. Open Supabase Dashboard → SQL Editor
2. Run the SQL from `supabase/migrations/expire_trial_subscriptions.sql`
3. This creates a function that runs daily at 00:05 UTC via pg_cron or Supabase Scheduled

**What it does:**
- Finds `user_subscriptions` where `status = 'trial'` and `trial_end < now()`
- Updates those to `status = 'expired'`
- Sets all their `published` forms back to `draft`
- Users see "Your trial has ended" banner and must subscribe to re-activate publishing

See [`docs/TRIAL_EXPIRATION.md`](TRIAL_EXPIRATION.md) for full details, testing steps, and monitoring queries.
