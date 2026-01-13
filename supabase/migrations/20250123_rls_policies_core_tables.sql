-- Migration: Comprehensive RLS Policies for Core Tables
-- This migration adds Row Level Security policies to all core tables
-- ensuring users can only access their own data

-- ============================================================
-- FORMS TABLE POLICIES
-- ============================================================
-- Enable RLS if not already enabled
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own forms" ON forms;
DROP POLICY IF EXISTS "Users can insert their own forms" ON forms;
DROP POLICY IF EXISTS "Users can update their own forms" ON forms;
DROP POLICY IF EXISTS "Users can delete their own forms" ON forms;
DROP POLICY IF EXISTS "Public can view published forms" ON forms;

-- Policy: Users can view their own forms
CREATE POLICY "Users can view their own forms"
  ON forms
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can insert their own forms
CREATE POLICY "Users can insert their own forms"
  ON forms
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own forms
CREATE POLICY "Users can update their own forms"
  ON forms
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own forms
CREATE POLICY "Users can delete their own forms"
  ON forms
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Anyone can view published forms (for public form access)
-- Note: This is required for anonymous users to access published forms
CREATE POLICY "Public can view published forms"
  ON forms
  FOR SELECT
  TO anon
  USING (status = 'published');

-- ============================================================
-- SUBMISSIONS TABLE POLICIES (legacy table)
-- ============================================================
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Form owners can view submissions" ON submissions;
DROP POLICY IF EXISTS "Anyone can insert submissions to published forms" ON submissions;

-- Policy: Form owners can view submissions to their forms
CREATE POLICY "Form owners can view submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

-- Policy: Anyone (including anonymous) can submit to published forms
CREATE POLICY "Anyone can insert submissions to published forms"
  ON submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    form_id IN (
      SELECT id FROM forms WHERE status = 'published'
    )
  );

-- ============================================================
-- FORM_SUBMISSIONS TABLE POLICIES
-- ============================================================
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Form owners can view their form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Anyone can insert submissions to published forms" ON form_submissions;

-- Policy: Form owners can view submissions to their forms
CREATE POLICY "Form owners can view their form submissions"
  ON form_submissions
  FOR SELECT
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

-- Policy: Anyone can submit to published forms
CREATE POLICY "Anyone can insert submissions to published forms"
  ON form_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    form_id IN (
      SELECT id FROM forms WHERE status = 'published'
    )
  );

-- ============================================================
-- FORM_VIEWS TABLE POLICIES
-- ============================================================
ALTER TABLE form_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Form owners can view their form analytics" ON form_views;
DROP POLICY IF EXISTS "Anyone can insert form views" ON form_views;

-- Policy: Form owners can view analytics for their forms
CREATE POLICY "Form owners can view their form analytics"
  ON form_views
  FOR SELECT
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

-- Policy: Anyone can insert form view records
CREATE POLICY "Anyone can insert form views"
  ON form_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    form_id IN (
      SELECT id FROM forms WHERE status = 'published'
    )
  );

-- ============================================================
-- FORM_FILES TABLE POLICIES
-- ============================================================
-- Enable RLS (it was disabled)
ALTER TABLE form_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Form owners can view their form files" ON form_files;
DROP POLICY IF EXISTS "Anyone can insert files to published forms" ON form_files;

-- Policy: Form owners can view files uploaded to their forms
CREATE POLICY "Form owners can view their form files"
  ON form_files
  FOR SELECT
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

-- Policy: Anyone can upload files to published forms
CREATE POLICY "Anyone can insert files to published forms"
  ON form_files
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    form_id IN (
      SELECT id FROM forms WHERE status = 'published'
    )
  );

-- ============================================================
-- SHEET_CONNECTIONS TABLE POLICIES
-- ============================================================
ALTER TABLE sheet_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sheet connections" ON sheet_connections;
DROP POLICY IF EXISTS "Users can insert their own sheet connections" ON sheet_connections;
DROP POLICY IF EXISTS "Users can update their own sheet connections" ON sheet_connections;
DROP POLICY IF EXISTS "Users can delete their own sheet connections" ON sheet_connections;

-- Policy: Users can view their own sheet connections
CREATE POLICY "Users can view their own sheet connections"
  ON sheet_connections
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can insert their own sheet connections
CREATE POLICY "Users can insert their own sheet connections"
  ON sheet_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own sheet connections
CREATE POLICY "Users can update their own sheet connections"
  ON sheet_connections
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own sheet connections
CREATE POLICY "Users can delete their own sheet connections"
  ON sheet_connections
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- USER_GOOGLE_TOKENS TABLE POLICIES
-- ============================================================
ALTER TABLE user_google_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tokens" ON user_google_tokens;
DROP POLICY IF EXISTS "Users can insert their own tokens" ON user_google_tokens;
DROP POLICY IF EXISTS "Users can update their own tokens" ON user_google_tokens;
DROP POLICY IF EXISTS "Users can delete their own tokens" ON user_google_tokens;

-- Policy: Users can only access their own Google tokens
CREATE POLICY "Users can view their own tokens"
  ON user_google_tokens
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tokens"
  ON user_google_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tokens"
  ON user_google_tokens
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own tokens"
  ON user_google_tokens
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- FORM_CALENDAR_SETTINGS TABLE POLICIES
-- ============================================================
ALTER TABLE form_calendar_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Form owners can view calendar settings" ON form_calendar_settings;
DROP POLICY IF EXISTS "Form owners can insert calendar settings" ON form_calendar_settings;
DROP POLICY IF EXISTS "Form owners can update calendar settings" ON form_calendar_settings;
DROP POLICY IF EXISTS "Form owners can delete calendar settings" ON form_calendar_settings;

-- Policy: Form owners can manage calendar settings for their forms
CREATE POLICY "Form owners can view calendar settings"
  ON form_calendar_settings
  FOR SELECT
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Form owners can insert calendar settings"
  ON form_calendar_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Form owners can update calendar settings"
  ON form_calendar_settings
  FOR UPDATE
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Form owners can delete calendar settings"
  ON form_calendar_settings
  FOR DELETE
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- CALENDAR_EVENTS_LOG TABLE POLICIES
-- ============================================================
ALTER TABLE calendar_events_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Form owners can view calendar events log" ON calendar_events_log;

-- Policy: Form owners can view calendar event logs for their forms
CREATE POLICY "Form owners can view calendar events log"
  ON calendar_events_log
  FOR SELECT
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

-- Note: Only backend (service role) should insert calendar event logs
-- No insert policy for authenticated users

-- ============================================================
-- EMAIL_NOTIFICATIONS_LOG TABLE POLICIES
-- ============================================================
ALTER TABLE email_notifications_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Form owners can view email notifications log" ON email_notifications_log;

-- Policy: Form owners can view email notification logs for their forms
CREATE POLICY "Form owners can view email notifications log"
  ON email_notifications_log
  FOR SELECT
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

-- Note: Only backend (service role) should insert email notification logs
-- No insert policy for authenticated users

-- ============================================================
-- FORM_EMAIL_SETTINGS TABLE POLICIES
-- ============================================================
ALTER TABLE form_email_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Form owners can view email settings" ON form_email_settings;
DROP POLICY IF EXISTS "Form owners can insert email settings" ON form_email_settings;
DROP POLICY IF EXISTS "Form owners can update email settings" ON form_email_settings;
DROP POLICY IF EXISTS "Form owners can delete email settings" ON form_email_settings;

-- Policy: Form owners can manage email settings for their forms
CREATE POLICY "Form owners can view email settings"
  ON form_email_settings
  FOR SELECT
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Form owners can insert email settings"
  ON form_email_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Form owners can update email settings"
  ON form_email_settings
  FOR UPDATE
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Form owners can delete email settings"
  ON form_email_settings
  FOR DELETE
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- DAILY_FORM_ANALYTICS TABLE POLICIES
-- ============================================================
ALTER TABLE daily_form_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Form owners can view their form analytics" ON daily_form_analytics;

-- Policy: Form owners can view analytics for their forms
CREATE POLICY "Form owners can view their form analytics"
  ON daily_form_analytics
  FOR SELECT
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

-- Note: Analytics are typically inserted by backend/cron jobs
-- No insert policy for authenticated users

-- ============================================================
-- SUBSCRIPTION-RELATED TABLES (already have some RLS)
-- ============================================================
-- Ensure RLS is enabled on remaining subscription tables

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Subscription Plans: Anyone can view (for pricing page)
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- User Subscriptions: Users can only view their own
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
CREATE POLICY "Users can view their own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Payment Authorizations: Users can only view their own
DROP POLICY IF EXISTS "Users can view their own payment methods" ON payment_authorizations;
CREATE POLICY "Users can view their own payment methods"
  ON payment_authorizations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Invoices: Users can only view their own
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
CREATE POLICY "Users can view their own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Payment Transactions: Users can only view their own
DROP POLICY IF EXISTS "Users can view their own transactions" ON payment_transactions;
CREATE POLICY "Users can view their own transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Usage Tracking: Users can only view their own
DROP POLICY IF EXISTS "Users can view their own usage" ON usage_tracking;
CREATE POLICY "Users can view their own usage"
  ON usage_tracking
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- SERVICE ROLE BYPASS
-- ============================================================
-- Note: The service role (used by backend API routes) bypasses
-- all RLS policies automatically. This is intentional and allows
-- the backend to manage data on behalf of users while keeping
-- client-side access restricted.

-- Add comments for documentation
COMMENT ON POLICY "Users can view their own forms" ON forms IS 
'Allows authenticated users to view only their own forms';

COMMENT ON POLICY "Public can view published forms" ON forms IS 
'Allows anonymous users to view published forms for public form access';

COMMENT ON POLICY "Form owners can view submissions" ON submissions IS 
'Allows form owners to view submissions to their forms only';

COMMENT ON POLICY "Anyone can insert submissions to published forms" ON submissions IS 
'Allows anyone (including anonymous users) to submit to published forms';

