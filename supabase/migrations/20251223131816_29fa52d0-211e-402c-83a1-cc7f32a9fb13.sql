-- =====================================================
-- CORRECTION RLS : Renforcement de la sécurité
-- =====================================================

-- 1. Ajouter la politique UPDATE pour merchants
-- Permet aux marchands de mettre à jour leurs propres données
CREATE POLICY "Merchants can update own data"
ON public.merchants
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Recréer la politique SELECT merchants avec TO authenticated
-- (Plus restrictif que public)
DROP POLICY IF EXISTS "Merchants can view own data" ON public.merchants;

CREATE POLICY "Merchants can view own data"
ON public.merchants
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Recréer la politique Agents can view enrolled merchants avec TO authenticated
DROP POLICY IF EXISTS "Agents can view enrolled merchants" ON public.merchants;

CREATE POLICY "Agents can view enrolled merchants"
ON public.merchants
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM agents a
  WHERE a.user_id = auth.uid() AND a.id = merchants.enrolled_by
));

-- 4. Renforcer les politiques profiles avec TO authenticated
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- NOTE: Table otp_codes
-- =====================================================
-- La table otp_codes n'a PAS de user_id et est conçue pour être
-- accessible UNIQUEMENT via les Edge Functions (service_role).
-- RLS est activé SANS politiques = accès bloqué pour les clients.
-- C'est intentionnel et sécurisé car :
-- - send-otp-sms utilise service_role pour INSERT
-- - verify-otp utilise service_role pour SELECT/UPDATE
-- =====================================================

-- Ajouter un commentaire sur la table pour documentation
COMMENT ON TABLE public.otp_codes IS 'OTP codes for phone verification. RLS enabled without policies = service_role only access via Edge Functions (send-otp-sms, verify-otp).';