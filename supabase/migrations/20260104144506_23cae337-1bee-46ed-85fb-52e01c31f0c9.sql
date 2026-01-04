-- =====================================================
-- PHASE 1: Tables de Journalisation Sécurité
-- Architecture Authentification Sociale Multi-Couches
-- =====================================================

-- 1.1 Table auth_context_logs - Journal des décisions d'authentification
CREATE TABLE public.auth_context_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('direct_access', 'challenge', 'human_fallback')),
  trust_score INTEGER,
  factors JSONB DEFAULT '{}'::jsonb,
  device_fingerprint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  outcome TEXT CHECK (outcome IN ('success', 'failed', 'abandoned', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour requêtes fréquentes
CREATE INDEX idx_auth_context_logs_merchant_id ON public.auth_context_logs(merchant_id);
CREATE INDEX idx_auth_context_logs_phone ON public.auth_context_logs(phone);
CREATE INDEX idx_auth_context_logs_created_at ON public.auth_context_logs(created_at DESC);
CREATE INDEX idx_auth_context_logs_decision ON public.auth_context_logs(decision);

-- RLS pour auth_context_logs
ALTER TABLE public.auth_context_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all auth logs"
  ON public.auth_context_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert auth logs"
  ON public.auth_context_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Merchants can view own auth logs"
  ON public.auth_context_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM merchants m 
    WHERE m.id = auth_context_logs.merchant_id 
    AND m.user_id = auth.uid()
  ));

-- 1.2 Table risk_events - Événements de risque détectés
CREATE TABLE public.risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'new_device', 'unusual_location', 'unusual_time', 
    'repeated_failures', 'high_amount', 'suspicious_pattern'
  )),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB DEFAULT '{}'::jsonb,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour risk_events
CREATE INDEX idx_risk_events_merchant_id ON public.risk_events(merchant_id);
CREATE INDEX idx_risk_events_severity ON public.risk_events(severity);
CREATE INDEX idx_risk_events_unresolved ON public.risk_events(created_at DESC) WHERE resolved_at IS NULL;

-- RLS pour risk_events
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all risk events"
  ON public.risk_events FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can view and resolve risk events"
  ON public.risk_events FOR ALL
  USING (has_role(auth.uid(), 'agent'::app_role));

CREATE POLICY "System can insert risk events"
  ON public.risk_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Merchants can view own risk events"
  ON public.risk_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM merchants m 
    WHERE m.id = risk_events.merchant_id 
    AND m.user_id = auth.uid()
  ));

-- 1.3 Table trust_validations - Validations manuelles agent/coopérative
CREATE TABLE public.trust_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  requested_by_phone TEXT,
  validation_code TEXT NOT NULL,
  validated_by UUID,
  validator_role TEXT CHECK (validator_role IN ('agent', 'cooperative_admin', 'admin')),
  validation_type TEXT NOT NULL CHECK (validation_type IN (
    'identity', 'device', 'location', 'transaction', 'escalation'
  )),
  result TEXT DEFAULT 'pending' CHECK (result IN ('pending', 'approved', 'rejected', 'expired')),
  reason TEXT,
  notes TEXT,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes'),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour trust_validations
CREATE INDEX idx_trust_validations_merchant_id ON public.trust_validations(merchant_id);
CREATE INDEX idx_trust_validations_code ON public.trust_validations(validation_code);
CREATE INDEX idx_trust_validations_pending ON public.trust_validations(created_at DESC) 
  WHERE result = 'pending';

-- RLS pour trust_validations
ALTER TABLE public.trust_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all validations"
  ON public.trust_validations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can view and update validations"
  ON public.trust_validations FOR ALL
  USING (has_role(auth.uid(), 'agent'::app_role));

CREATE POLICY "System can insert validations"
  ON public.trust_validations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Merchants can view own validations"
  ON public.trust_validations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM merchants m 
    WHERE m.id = trust_validations.merchant_id 
    AND m.user_id = auth.uid()
  ));

-- 1.4 Table agent_actions - Actions des agents pour audit
CREATE TABLE public.agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'merchant_validation', 'escalation', 'device_trust', 
    'location_verify', 'risk_resolve', 'identity_confirm'
  )),
  target_merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
  validation_id UUID REFERENCES public.trust_validations(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb,
  outcome TEXT CHECK (outcome IN ('completed', 'escalated', 'rejected', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour agent_actions
CREATE INDEX idx_agent_actions_agent_id ON public.agent_actions(agent_id);
CREATE INDEX idx_agent_actions_merchant_id ON public.agent_actions(target_merchant_id);
CREATE INDEX idx_agent_actions_created_at ON public.agent_actions(created_at DESC);

-- RLS pour agent_actions
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all agent actions"
  ON public.agent_actions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can view own actions"
  ON public.agent_actions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM agents a 
    WHERE a.id = agent_actions.agent_id 
    AND a.user_id = auth.uid()
  ));

CREATE POLICY "Agents can insert own actions"
  ON public.agent_actions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM agents a 
    WHERE a.id = agent_actions.agent_id 
    AND a.user_id = auth.uid()
  ));

CREATE POLICY "System can insert agent actions"
  ON public.agent_actions FOR INSERT
  WITH CHECK (true);

-- 1.5 Fonction pour générer un code de validation court
CREATE OR REPLACE FUNCTION generate_validation_code()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 1.6 Fonction pour expirer automatiquement les validations
CREATE OR REPLACE FUNCTION expire_old_validations()
RETURNS void AS $$
BEGIN
  UPDATE public.trust_validations 
  SET result = 'expired' 
  WHERE result = 'pending' 
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;