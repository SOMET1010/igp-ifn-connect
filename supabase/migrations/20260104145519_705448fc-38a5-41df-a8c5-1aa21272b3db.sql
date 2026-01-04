-- ============================================
-- SPEC EXÉCUTABLE v1 - Phase 1: Alignement Schéma DB
-- ============================================

-- 1.1 Table merchants - Ajouts SPEC
ALTER TABLE merchants 
  ADD COLUMN IF NOT EXISTS preferred_lang TEXT DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS persona TEXT DEFAULT 'TANTIE';

-- Ajouter contraintes CHECK via trigger (plus flexible que CHECK constraint)
CREATE OR REPLACE FUNCTION validate_merchant_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preferred_lang NOT IN ('fr', 'dioula', 'baoule', 'bete', 'senoufo', 'maninka', 'nouchi') THEN
    RAISE EXCEPTION 'preferred_lang doit être fr, dioula, baoule, bete, senoufo, maninka ou nouchi';
  END IF;
  IF NEW.persona NOT IN ('TANTIE', 'JEUNE') THEN
    RAISE EXCEPTION 'persona doit être TANTIE ou JEUNE';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS validate_merchant_fields_trigger ON merchants;
CREATE TRIGGER validate_merchant_fields_trigger
  BEFORE INSERT OR UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION validate_merchant_fields();

-- Index unique sur phone (si pas déjà présent)
CREATE UNIQUE INDEX IF NOT EXISTS merchants_phone_unique ON merchants(phone);

-- 1.2 Créer trusted_devices (SPEC 1.1.B)
CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_label TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_revoked BOOLEAN DEFAULT FALSE,
  UNIQUE (merchant_id, device_fingerprint)
);

-- RLS pour trusted_devices
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their own devices"
  ON trusted_devices FOR SELECT
  USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));

CREATE POLICY "System can insert devices"
  ON trusted_devices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update devices"
  ON trusted_devices FOR UPDATE
  USING (true);

-- 1.3 Créer social_answers_hashed (SPEC 1.1.C)
CREATE TABLE IF NOT EXISTS social_answers_hashed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  challenge_key TEXT NOT NULL,
  answer_hash TEXT NOT NULL,
  answer_salt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (merchant_id, challenge_key)
);

-- Validation trigger pour challenge_key
CREATE OR REPLACE FUNCTION validate_social_answer_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.challenge_key NOT IN ('MARKET_NAME', 'MOTHER_FIRSTNAME', 'WHAT_YOU_SELL', 'NICKNAME') THEN
    RAISE EXCEPTION 'challenge_key doit être MARKET_NAME, MOTHER_FIRSTNAME, WHAT_YOU_SELL ou NICKNAME';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS validate_social_answer_trigger ON social_answers_hashed;
CREATE TRIGGER validate_social_answer_trigger
  BEFORE INSERT OR UPDATE ON social_answers_hashed
  FOR EACH ROW EXECUTE FUNCTION validate_social_answer_fields();

-- RLS pour social_answers_hashed
ALTER TABLE social_answers_hashed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage social answers"
  ON social_answers_hashed FOR ALL
  USING (true);

-- Migrer données existantes de merchant_security_questions si présentes
INSERT INTO social_answers_hashed (merchant_id, challenge_key, answer_hash, answer_salt, created_at, updated_at)
SELECT 
  merchant_id,
  CASE question_type
    WHEN 'market_name' THEN 'MARKET_NAME'
    WHEN 'mother_firstname' THEN 'MOTHER_FIRSTNAME'
    WHEN 'what_you_sell' THEN 'WHAT_YOU_SELL'
    WHEN 'nickname' THEN 'NICKNAME'
    ELSE 'MARKET_NAME'
  END,
  answer_hash,
  COALESCE(answer_normalized, 'default_salt'),
  created_at,
  updated_at
FROM merchant_security_questions
WHERE NOT EXISTS (
  SELECT 1 FROM social_answers_hashed sah 
  WHERE sah.merchant_id = merchant_security_questions.merchant_id
);

-- 1.4 Compléter auth_context_logs (SPEC 1.2.D)
ALTER TABLE auth_context_logs
  ADD COLUMN IF NOT EXISTS market_code TEXT,
  ADD COLUMN IF NOT EXISTS hour_bucket INTEGER,
  ADD COLUMN IF NOT EXISTS reason_codes JSONB DEFAULT '[]'::jsonb;

-- 1.5 Compléter trust_validations (SPEC 1.3.F)
ALTER TABLE trust_validations
  ADD COLUMN IF NOT EXISTS method TEXT;

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_trusted_devices_merchant ON trusted_devices(merchant_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_fingerprint ON trusted_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_social_answers_merchant ON social_answers_hashed(merchant_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_phone ON auth_context_logs(phone);
CREATE INDEX IF NOT EXISTS idx_auth_logs_merchant ON auth_context_logs(merchant_id);

-- Trigger updated_at pour social_answers_hashed
CREATE TRIGGER update_social_answers_updated_at
  BEFORE UPDATE ON social_answers_hashed
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();