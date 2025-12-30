-- ============================================
-- AUTHENTIFICATION SOCIALE - PHASE 2
-- Tables pour questions de sécurité, contexte de confiance et validations communautaires
-- ============================================

-- 1. Table des questions de sécurité culturelles
CREATE TABLE public.merchant_security_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL, -- 'mother_name', 'market_name', 'product_type', 'neighborhood', 'custom'
  question_text TEXT NOT NULL, -- "Quel est le prénom de ta maman ?"
  question_text_dioula TEXT, -- Version dioula de la question
  answer_hash TEXT NOT NULL, -- Hash SHA-256 de la réponse normalisée (sécurité)
  answer_normalized TEXT NOT NULL, -- Réponse normalisée pour comparaison vocale (minuscules, sans accents)
  audio_prompt_key TEXT, -- Clé pour le fichier audio de la question (TTS)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(merchant_id, question_type) -- Un seul type de question par marchand
);

-- Index pour recherche rapide
CREATE INDEX idx_security_questions_merchant ON merchant_security_questions(merchant_id);
CREATE INDEX idx_security_questions_active ON merchant_security_questions(merchant_id, is_active) WHERE is_active = true;

-- RLS pour merchant_security_questions
ALTER TABLE merchant_security_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view own questions"
ON merchant_security_questions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM merchants m
  WHERE m.id = merchant_security_questions.merchant_id
  AND m.user_id = auth.uid()
));

CREATE POLICY "Merchants can insert own questions"
ON merchant_security_questions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM merchants m
  WHERE m.id = merchant_security_questions.merchant_id
  AND m.user_id = auth.uid()
));

CREATE POLICY "Merchants can update own questions"
ON merchant_security_questions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM merchants m
  WHERE m.id = merchant_security_questions.merchant_id
  AND m.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all questions"
ON merchant_security_questions FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Agents can view enrolled merchants questions"
ON merchant_security_questions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM merchants m
  JOIN agents a ON a.id = m.enrolled_by
  WHERE m.id = merchant_security_questions.merchant_id
  AND a.user_id = auth.uid()
));

-- 2. Table des scores de contexte d'authentification
CREATE TABLE public.auth_context_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  -- Identifiant du device
  device_fingerprint TEXT, -- Hash du navigateur/téléphone
  device_name TEXT, -- "Samsung Galaxy A12" (optionnel)
  
  -- Contexte géographique habituel
  usual_market_id UUID REFERENCES markets(id),
  usual_gps_latitude NUMERIC,
  usual_gps_longitude NUMERIC,
  gps_tolerance_meters INTEGER DEFAULT 500, -- Tolérance de distance
  
  -- Contexte temporel habituel
  usual_login_hours_start INTEGER DEFAULT 6, -- Heure de début (6h)
  usual_login_hours_end INTEGER DEFAULT 20, -- Heure de fin (20h)
  usual_days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6}', -- Lundi-Samedi (1-7)
  
  -- Score de confiance calculé
  trust_score INTEGER DEFAULT 50,
  trust_score_updated_at TIMESTAMPTZ,
  
  -- Historique
  successful_logins INTEGER DEFAULT 0,
  failed_logins INTEGER DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  last_login_ip TEXT,
  
  -- Métadonnées
  is_primary_device BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(merchant_id, device_fingerprint) -- Un contexte par device
);

-- Contrainte de check séparée pour éviter les problèmes de restauration
ALTER TABLE auth_context_scores ADD CONSTRAINT check_trust_score_range CHECK (trust_score >= 0 AND trust_score <= 100);

-- Index pour recherche rapide
CREATE INDEX idx_auth_context_merchant ON auth_context_scores(merchant_id);
CREATE INDEX idx_auth_context_device ON auth_context_scores(device_fingerprint);
CREATE INDEX idx_auth_context_trust ON auth_context_scores(merchant_id, trust_score);

-- RLS pour auth_context_scores
ALTER TABLE auth_context_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view own context"
ON auth_context_scores FOR SELECT
USING (EXISTS (
  SELECT 1 FROM merchants m
  WHERE m.id = auth_context_scores.merchant_id
  AND m.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all contexts"
ON auth_context_scores FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Insertion/mise à jour publique pour l'authentification (avant que l'user soit connecté)
CREATE POLICY "Public insert for auth context"
ON auth_context_scores FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update for auth context"
ON auth_context_scores FOR UPDATE
USING (true);

-- 3. Table des validations communautaires
CREATE TABLE public.community_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Qui demande la validation
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  request_context TEXT, -- "Nouveau device", "Localisation inhabituelle", etc.
  
  -- Qui valide
  validated_by_user_id UUID,
  validator_type TEXT NOT NULL, -- 'agent', 'cooperative_leader', 'known_merchant', 'family'
  validator_name TEXT, -- Nom du validateur (pour traçabilité)
  validator_phone TEXT, -- Téléphone du validateur
  
  -- Comment la validation a été faite
  validation_method TEXT, -- 'in_person', 'phone_call', 'video_call', 'app_confirmation', 'qr_scan'
  validation_location_latitude NUMERIC,
  validation_location_longitude NUMERIC,
  
  -- Résultat
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
  validated_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  
  -- Expiration (les demandes expirent après 24h)
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_community_validations_merchant ON community_validations(merchant_id);
CREATE INDEX idx_community_validations_status ON community_validations(status) WHERE status = 'pending';
CREATE INDEX idx_community_validations_validator ON community_validations(validated_by_user_id);
CREATE INDEX idx_community_validations_expires ON community_validations(expires_at) WHERE status = 'pending';

-- RLS pour community_validations
ALTER TABLE community_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view own validations"
ON community_validations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM merchants m
  WHERE m.id = community_validations.merchant_id
  AND m.user_id = auth.uid()
));

CREATE POLICY "Merchants can request validations"
ON community_validations FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM merchants m
  WHERE m.id = community_validations.merchant_id
  AND m.user_id = auth.uid()
));

CREATE POLICY "Agents can view and update validations"
ON community_validations FOR ALL
USING (has_role(auth.uid(), 'agent'));

CREATE POLICY "Admins can manage all validations"
ON community_validations FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Validators can update their validations"
ON community_validations FOR UPDATE
USING (validated_by_user_id = auth.uid());

-- 4. Fonction RPC pour calculer le score de confiance
CREATE OR REPLACE FUNCTION public.calculate_trust_score(
  p_merchant_id UUID,
  p_device_fingerprint TEXT,
  p_latitude NUMERIC DEFAULT NULL,
  p_longitude NUMERIC DEFAULT NULL,
  p_login_hour INTEGER DEFAULT NULL
)
RETURNS TABLE (
  trust_score INTEGER,
  factors JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score INTEGER := 0;
  v_factors JSONB := '{}';
  v_context auth_context_scores%ROWTYPE;
  v_distance NUMERIC;
BEGIN
  -- Récupérer le contexte existant pour ce device
  SELECT * INTO v_context
  FROM auth_context_scores
  WHERE merchant_id = p_merchant_id
    AND device_fingerprint = p_device_fingerprint
  LIMIT 1;
  
  -- Si device connu
  IF v_context.id IS NOT NULL THEN
    v_score := v_score + 30;
    v_factors := v_factors || '{"known_device": true}';
    
    -- Si device principal
    IF v_context.is_primary_device THEN
      v_score := v_score + 20;
      v_factors := v_factors || '{"primary_device": true}';
    END IF;
  ELSE
    v_factors := v_factors || '{"known_device": false}';
  END IF;
  
  -- Vérifier la géolocalisation
  IF p_latitude IS NOT NULL AND p_longitude IS NOT NULL AND v_context.usual_gps_latitude IS NOT NULL THEN
    -- Calcul distance approximatif en mètres (formule haversine simplifiée)
    v_distance := 111320 * SQRT(
      POWER(p_latitude - v_context.usual_gps_latitude, 2) +
      POWER((p_longitude - v_context.usual_gps_longitude) * COS(RADIANS(p_latitude)), 2)
    );
    
    IF v_distance <= COALESCE(v_context.gps_tolerance_meters, 500) THEN
      v_score := v_score + 25;
      v_factors := v_factors || jsonb_build_object('location_match', true, 'distance_meters', ROUND(v_distance));
    ELSE
      v_factors := v_factors || jsonb_build_object('location_match', false, 'distance_meters', ROUND(v_distance));
    END IF;
  END IF;
  
  -- Vérifier l'heure habituelle
  IF p_login_hour IS NOT NULL AND v_context.usual_login_hours_start IS NOT NULL THEN
    IF p_login_hour >= v_context.usual_login_hours_start AND p_login_hour <= v_context.usual_login_hours_end THEN
      v_score := v_score + 15;
      v_factors := v_factors || '{"usual_hours": true}';
    ELSE
      v_factors := v_factors || '{"usual_hours": false}';
    END IF;
  END IF;
  
  -- Bonus pour les connexions réussies précédentes
  IF v_context.successful_logins IS NOT NULL THEN
    IF v_context.successful_logins > 10 THEN
      v_score := v_score + 10;
      v_factors := v_factors || '{"login_history": "excellent"}';
    ELSIF v_context.successful_logins > 5 THEN
      v_score := v_score + 5;
      v_factors := v_factors || '{"login_history": "good"}';
    ELSE
      v_factors := v_factors || '{"login_history": "new"}';
    END IF;
  END IF;
  
  -- Plafonner à 100
  trust_score := LEAST(v_score, 100);
  factors := v_factors;
  
  RETURN NEXT;
END;
$$;

-- 5. Trigger pour mettre à jour updated_at
CREATE TRIGGER update_security_questions_updated_at
BEFORE UPDATE ON merchant_security_questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auth_context_updated_at
BEFORE UPDATE ON auth_context_scores
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_validations_updated_at
BEFORE UPDATE ON community_validations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();