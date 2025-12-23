-- Table pour stocker les codes OTP temporaires
CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche rapide par téléphone
CREATE INDEX idx_otp_codes_phone ON public.otp_codes(phone);

-- Index pour nettoyage des codes expirés
CREATE INDEX idx_otp_codes_expires_at ON public.otp_codes(expires_at);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Politique: les edge functions peuvent tout faire via service_role
-- Pas de politique pour les utilisateurs normaux car géré par les edge functions