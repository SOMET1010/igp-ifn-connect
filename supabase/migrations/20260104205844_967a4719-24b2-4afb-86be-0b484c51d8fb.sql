-- 1. Ajouter le rôle 'client' à l'enum app_role
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'client';

-- 2. Créer la table clients (bénéficiaires)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  city TEXT,
  region TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'blocked')),
  kyc_level TEXT DEFAULT 'level_0' CHECK (kyc_level IN ('level_0', 'level_1', 'level_2')),
  balance NUMERIC DEFAULT 0,
  registered_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche rapide par téléphone
CREATE UNIQUE INDEX idx_clients_phone ON public.clients(phone);
CREATE INDEX idx_clients_user_id ON public.clients(user_id);

-- 3. Créer la table financial_services (catalogue)
CREATE TABLE public.financial_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('savings', 'credit', 'insurance', 'mobile_money', 'transfer')),
  description TEXT,
  provider_name TEXT NOT NULL,
  icon TEXT,
  min_amount NUMERIC DEFAULT 0,
  max_amount NUMERIC,
  interest_rate NUMERIC,
  fees JSONB DEFAULT '{}',
  eligibility_criteria JSONB DEFAULT '{}',
  min_kyc_level TEXT DEFAULT 'level_0',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Créer la table client_services (services activés par client)
CREATE TABLE public.client_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.financial_services(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  activated_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, service_id)
);

-- 5. Créer la table client_transactions
CREATE TABLE public.client_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.financial_services(id),
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'payment', 'fee')),
  amount NUMERIC NOT NULL,
  fee_amount NUMERIC DEFAULT 0,
  balance_after NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  reference TEXT,
  description TEXT,
  counterparty_phone TEXT,
  counterparty_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_client_transactions_client_id ON public.client_transactions(client_id);
CREATE INDEX idx_client_transactions_created_at ON public.client_transactions(created_at DESC);

-- 6. Activer RLS sur toutes les tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_transactions ENABLE ROW LEVEL SECURITY;

-- 7. Policies pour clients
CREATE POLICY "Clients can view own data"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Clients can update own data"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can self-register as client"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Agents can view registered clients"
  ON public.clients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM agents a 
    WHERE a.user_id = auth.uid() AND a.id = clients.registered_by
  ));

CREATE POLICY "Agents can register clients"
  ON public.clients FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'agent'::app_role));

CREATE POLICY "Admins can manage all clients"
  ON public.clients FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. Policies pour financial_services (lecture publique pour authentifiés)
CREATE POLICY "Authenticated users can view active services"
  ON public.financial_services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage financial services"
  ON public.financial_services FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 9. Policies pour client_services
CREATE POLICY "Clients can view own services"
  ON public.client_services FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients c WHERE c.id = client_services.client_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Clients can activate services"
  ON public.client_services FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM clients c WHERE c.id = client_services.client_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Clients can update own services"
  ON public.client_services FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM clients c WHERE c.id = client_services.client_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all client services"
  ON public.client_services FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 10. Policies pour client_transactions
CREATE POLICY "Clients can view own transactions"
  ON public.client_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients c WHERE c.id = client_transactions.client_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Clients can create transactions"
  ON public.client_transactions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM clients c WHERE c.id = client_transactions.client_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all transactions"
  ON public.client_transactions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 11. Trigger pour updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_services_updated_at
  BEFORE UPDATE ON public.client_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Insérer les services financiers pré-configurés
INSERT INTO public.financial_services (name, type, provider_name, description, icon, min_amount, max_amount, interest_rate, min_kyc_level, display_order) VALUES
('Compte Épargne PNAVIM', 'savings', 'PNAVIM', 'Épargnez en toute sécurité avec un taux de 5% par an. Accès à votre argent à tout moment.', 'piggy-bank', 1000, 10000000, 5.0, 'level_1', 1),
('Micro-Crédit Tantie', 'credit', 'PNAVIM', 'Prêt de 50.000 à 500.000 FCFA pour développer votre activité. Remboursement flexible.', 'banknote', 50000, 500000, 12.0, 'level_2', 2),
('Assurance Récolte', 'insurance', 'PNAVIM Assur', 'Protégez vos cultures contre les aléas climatiques. Prime mensuelle abordable.', 'shield', 5000, 100000, NULL, 'level_1', 3),
('Orange Money', 'mobile_money', 'Orange CI', 'Envoyez et recevez de l''argent partout en Côte d''Ivoire. Frais réduits.', 'smartphone', 100, 2000000, NULL, 'level_0', 4),
('Virement Instant', 'transfer', 'PNAVIM', 'Transférez de l''argent instantanément entre clients PNAVIM. Sans frais!', 'send', 500, 5000000, NULL, 'level_0', 5);