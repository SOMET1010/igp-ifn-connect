-- Fix system_logs: restrict INSERT to service role only
-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert logs" ON public.system_logs;

-- No INSERT policy needed - service role bypasses RLS by default
-- This means only backend/edge functions with service role can insert

-- Fix notification_logs: restrict INSERT to service role only  
-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert notification logs" ON public.notification_logs;

-- No INSERT policy needed - service role bypasses RLS by default
-- This means only backend/edge functions with service role can insert