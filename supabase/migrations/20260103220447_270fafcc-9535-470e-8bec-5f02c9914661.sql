-- =============================================
-- PHASE 1: WALLET P2P - Tables principales
-- =============================================

-- Table des portefeuilles marchands
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency TEXT NOT NULL DEFAULT 'XOF',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wallets_merchant_unique UNIQUE (merchant_id)
);

-- Table des transactions wallet
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('transfer_sent', 'transfer_received', 'deposit', 'withdrawal', 'payment', 'refund')),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  fee DECIMAL(12,2) DEFAULT 0,
  counterparty_wallet_id UUID REFERENCES public.wallets(id),
  counterparty_name TEXT,
  counterparty_phone TEXT,
  reference TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des bénéficiaires (contacts fréquents)
CREATE TABLE public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  beneficiary_wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  nickname TEXT,
  is_favorite BOOLEAN DEFAULT false,
  transfer_count INTEGER DEFAULT 0,
  last_transfer_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT beneficiaries_unique UNIQUE (owner_wallet_id, beneficiary_wallet_id),
  CONSTRAINT beneficiaries_no_self CHECK (owner_wallet_id != beneficiary_wallet_id)
);

-- Index pour performances
CREATE INDEX idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_status ON public.wallet_transactions(status);
CREATE INDEX idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);
CREATE INDEX idx_beneficiaries_owner ON public.beneficiaries(owner_wallet_id);

-- Trigger pour updated_at sur wallets
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour wallets
CREATE POLICY "Merchants can view own wallet"
  ON public.wallets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM merchants m 
    WHERE m.id = wallets.merchant_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "System can create wallets"
  ON public.wallets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update wallets"
  ON public.wallets FOR UPDATE
  USING (true);

CREATE POLICY "Admins can view all wallets"
  ON public.wallets FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies pour wallet_transactions
CREATE POLICY "Merchants can view own transactions"
  ON public.wallet_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM wallets w 
    JOIN merchants m ON m.id = w.merchant_id
    WHERE w.id = wallet_transactions.wallet_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "System can insert transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update transactions"
  ON public.wallet_transactions FOR UPDATE
  USING (true);

CREATE POLICY "Admins can view all transactions"
  ON public.wallet_transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies pour beneficiaries
CREATE POLICY "Merchants can manage own beneficiaries"
  ON public.beneficiaries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM wallets w 
    JOIN merchants m ON m.id = w.merchant_id
    WHERE w.id = beneficiaries.owner_wallet_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all beneficiaries"
  ON public.beneficiaries FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Fonction pour générer une référence unique
CREATE OR REPLACE FUNCTION public.generate_wallet_reference()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'TXN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8));
END;
$$;

-- Fonction pour créer un wallet automatiquement pour un nouveau marchand
CREATE OR REPLACE FUNCTION public.create_merchant_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO wallets (merchant_id)
  VALUES (NEW.id)
  ON CONFLICT (merchant_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger pour créer wallet automatiquement
CREATE TRIGGER create_wallet_on_merchant_insert
  AFTER INSERT ON public.merchants
  FOR EACH ROW
  EXECUTE FUNCTION public.create_merchant_wallet();

-- Créer les wallets pour les marchands existants
INSERT INTO public.wallets (merchant_id)
SELECT id FROM public.merchants
ON CONFLICT (merchant_id) DO NOTHING;