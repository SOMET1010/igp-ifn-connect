-- Enable RLS on otp_codes table
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Document that this table is server-only access
COMMENT ON TABLE public.otp_codes IS 
  'Table des codes OTP. Accès uniquement via edge functions (service role). Aucun accès client autorisé.';

-- Allow admins to view OTP codes for debugging purposes only
CREATE POLICY "Admins can view otp_codes for debugging"
ON public.otp_codes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));