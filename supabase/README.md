# Supabase Migrations

This folder contains SQL migrations and database functions for the ShelfCue application.

## Available Migrations

### `expire_trial_subscriptions.sql`

**Purpose:** Automatically expire trial subscriptions after 14 days and unpublish forms.

**What it does:**
- Creates a Postgres function that finds trial subscriptions past their `trial_end` date
- Updates those subscriptions from `status = 'trial'` to `status = 'expired'`
- Sets all published forms for those users back to `status = 'draft'`
- Schedules the function to run daily at 00:05 UTC

**Setup:**
See [`docs/SETUP_TRIAL_EXPIRATION.md`](../docs/SETUP_TRIAL_EXPIRATION.md) for step-by-step instructions.

**Quick start:**
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire `expire_trial_subscriptions.sql` file
3. Click Run
4. Verify with: `select * from cron.job where jobname = 'expire_trials_daily';`

## How to Run Migrations

Since this project doesn't use Supabase CLI migrations (yet), run these manually:

1. Open your Supabase project dashboard
2. Go to **Database → SQL Editor**
3. Create a new query
4. Copy the SQL from the migration file
5. Run it
6. Verify the changes using the test queries in the migration file

## Future Migrations

If you need to add more migrations:
1. Create a new `.sql` file in this folder
2. Name it descriptively (e.g., `add_email_notifications.sql`)
3. Include:
   - Clear comments explaining what it does
   - The SQL to create/modify the schema
   - Test queries to verify it worked
   - Rollback instructions if needed
4. Update this README with a brief description

## Notes

- All migrations should be **idempotent** (safe to run multiple times)
- Use `create or replace` for functions
- Use `if not exists` for tables/columns when possible
- Always include rollback instructions
- Test in a staging project first
