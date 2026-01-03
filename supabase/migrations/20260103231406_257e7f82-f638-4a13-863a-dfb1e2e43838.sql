-- Créer les types enum pour KYC
CREATE TYPE kyc_level AS ENUM ('level_0', 'level_1', 'level_2');
CREATE TYPE kyc_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected');

-- Table des demandes KYC
CREATE TABLE kyc_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  level kyc_level NOT NULL DEFAULT 'level_0',
  status kyc_status NOT NULL DEFAULT 'draft',
  -- Level 1 : Téléphone vérifié
  phone_verified BOOLEAN DEFAULT false,
  phone_verified_at TIMESTAMPTZ,
  -- Level 2 : Documents
  id_document_type TEXT, -- 'cni', 'passport', 'cmu'
  id_document_url TEXT,
  id_document_number TEXT,
  id_document_expiry DATE,
  selfie_url TEXT,
  address TEXT,
  -- Validation
  submitted_at TIMESTAMPTZ,
  submitted_by UUID, -- Agent qui a soumis (si enrôlement assisté)
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX idx_kyc_requests_user_id ON kyc_requests(user_id);
CREATE INDEX idx_kyc_requests_merchant_id ON kyc_requests(merchant_id);
CREATE INDEX idx_kyc_requests_status ON kyc_requests(status);

-- Enable RLS
ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view own kyc requests"
ON kyc_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kyc requests"
ON kyc_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own draft kyc requests"
ON kyc_requests FOR UPDATE
USING (auth.uid() = user_id AND status = 'draft')
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Agents can view kyc requests for enrolled merchants"
ON kyc_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM merchants m
    JOIN agents a ON a.id = m.enrolled_by
    WHERE m.id = kyc_requests.merchant_id
    AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Agents can submit kyc requests"
ON kyc_requests FOR UPDATE
USING (
  has_role(auth.uid(), 'agent') AND status = 'draft'
);

CREATE POLICY "Admins can manage all kyc requests"
ON kyc_requests FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Trigger pour updated_at
CREATE TRIGGER update_kyc_requests_updated_at
BEFORE UPDATE ON kyc_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour obtenir le niveau KYC d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_kyc_level(_user_id UUID)
RETURNS kyc_level
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT level FROM kyc_requests 
     WHERE user_id = _user_id 
     AND status = 'approved'
     ORDER BY level DESC
     LIMIT 1),
    'level_0'::kyc_level
  )
$$;

-- Fonction pour vérifier si un utilisateur a un niveau KYC minimum
CREATE OR REPLACE FUNCTION has_kyc_level(_user_id UUID, _min_level kyc_level)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT get_user_kyc_level(_user_id) >= _min_level
$$;