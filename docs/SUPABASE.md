# Supabase setup for ShelfCue

Use this checklist to ensure your Supabase project has the schema and env the app expects for auth and data storage.

## Environment variables

In your app (e.g. Vercel / `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` – project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon/public key (client)
- `SUPABASE_SERVICE_ROLE_KEY` – service role key (server-only; API routes, webhooks)

Never expose the service role key to the client.

## Tables the app uses

### 1. `forms`

Core table storing form definitions.

### 2. `form_submissions`

Stores all responses submitted to forms.

### 3. `usage_tracking`

Optional table used to track submission counts per user per billing period (for analytics only — not used to gate access).

| Column           | Type        | Notes                       |
|------------------|-------------|-----------------------------|
| id               | uuid        | PK                          |
| user_id          | uuid        | FK → auth.users             |
| period_start     | timestamptz |                             |
| period_end       | timestamptz |                             |
| submissions_count| integer     | default 0                   |
| storage_used_mb  | numeric     | default 0                   |
| api_calls_count  | integer     | default 0                   |
| created_at       | timestamptz | optional                    |

### 4. `subscription_plans`, `user_subscriptions`, `payment_transactions`, `subscription_cancellations`

These tables exist in the database but are **no longer used by the application**. ShelfCue is fully free — no payment or subscription checks are performed in the app code.

You may leave these tables in place or remove them via the Supabase dashboard if you wish. To clean up:

1. Open **Supabase Dashboard → Database → Tables** and drop `subscription_plans`, `user_subscriptions`, `payment_transactions`, `subscription_cancellations`.
2. Open **Database → Scheduled Jobs** (pg_cron) and delete the `expire_trial_subscriptions` job if it exists.
3. Remove any Paystack environment variables (`PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_WEBHOOK_SECRET`) from your hosting environment — they are no longer used.

## Regenerating TypeScript types

After changing the schema in Supabase, regenerate types so `src/lib/supabase/database.types.ts` stays in sync:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/lib/supabase/database.types.ts
```

Get `YOUR_PROJECT_REF` from the Supabase dashboard URL or project settings.
