-- Migration: RPC Function Security Hardening
-- This migration ensures all RPC functions follow least-privilege principles

-- ============================================================
-- SCHEMA_CACHE_RELOAD FUNCTION
-- ============================================================
-- This function reloads the PostgREST schema cache
-- Required for dynamic schema changes (like new policies)

-- Create or replace the function
CREATE OR REPLACE FUNCTION schema_cache_reload()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
SET search_path = public
AS $$
BEGIN
  -- Notify PostgREST to reload its schema cache
  PERFORM pg_notify('pgrst', 'reload schema');
END;
$$;

-- Revoke all permissions from public
REVOKE ALL ON FUNCTION schema_cache_reload() FROM PUBLIC;
REVOKE ALL ON FUNCTION schema_cache_reload() FROM anon;
REVOKE ALL ON FUNCTION schema_cache_reload() FROM authenticated;

-- Grant execute only to service_role
GRANT EXECUTE ON FUNCTION schema_cache_reload() TO service_role;

-- Add documentation
COMMENT ON FUNCTION schema_cache_reload() IS 
'Reloads the PostgREST schema cache. Only callable by service_role. Used when schema changes need to be immediately reflected.';

-- ============================================================
-- UPDATE_EXPIRED_TRIALS FUNCTION HARDENING
-- ============================================================
-- This function was already created in 20250121_trial_management.sql
-- We're adding additional security restrictions

-- Revoke public access
REVOKE ALL ON FUNCTION update_expired_trials() FROM PUBLIC;
REVOKE ALL ON FUNCTION update_expired_trials() FROM anon;
REVOKE ALL ON FUNCTION update_expired_trials() FROM authenticated;

-- Grant execute only to service_role
GRANT EXECUTE ON FUNCTION update_expired_trials() TO service_role;

-- Update documentation
COMMENT ON FUNCTION update_expired_trials() IS 
'Updates expired trial subscriptions and deactivates their forms. Only callable by service_role via cron jobs or edge functions. Returns count of updated subscriptions.';

-- ============================================================
-- AUDIT: LIST ALL SECURITY DEFINER FUNCTIONS
-- ============================================================
-- Query to identify all SECURITY DEFINER functions
-- (For manual review - this is a comment, not executed)

/*
SELECT 
  n.nspname as schema,
  p.proname as function,
  pg_get_functiondef(p.oid) as definition,
  CASE 
    WHEN prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND prosecdef = true
ORDER BY p.proname;
*/

-- ============================================================
-- BEST PRACTICES FOR FUTURE RPC FUNCTIONS
-- ============================================================
/*
SECURITY GUIDELINES:

1. Default to SECURITY INVOKER (runs with caller's privileges)
   Unless elevated privileges are absolutely required

2. If SECURITY DEFINER is needed:
   - Set search_path explicitly (prevents schema injection)
   - Validate ALL inputs thoroughly
   - Limit to minimum required operations
   - Document why DEFINER is necessary

3. Access Control:
   - Always REVOKE from PUBLIC first
   - Grant to specific roles (service_role, authenticated) as needed
   - Never grant to anon for administrative functions

4. Example Safe Function:

CREATE OR REPLACE FUNCTION safe_admin_function(param TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate inputs
  IF param IS NULL OR param = '' THEN
    RAISE EXCEPTION 'Invalid parameter';
  END IF;
  
  -- Perform operation
  -- ...
END;
$$;

REVOKE ALL ON FUNCTION safe_admin_function(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION safe_admin_function(TEXT) TO service_role;
*/

