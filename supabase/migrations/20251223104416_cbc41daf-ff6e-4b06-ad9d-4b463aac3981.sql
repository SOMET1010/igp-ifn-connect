-- Table des coopératives vivriers
CREATE TABLE public.vivriers_cooperatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  region TEXT,
  commune TEXT,
  effectif_total INTEGER DEFAULT 0,
  effectif_cmu INTEGER DEFAULT 0,
  effectif_cnps INTEGER DEFAULT 0,
  phone TEXT,
  email TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des membres vivriers
CREATE TABLE public.vivriers_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_key TEXT NOT NULL UNIQUE,
  cooperative_id UUID REFERENCES public.vivriers_cooperatives(id) ON DELETE SET NULL,
  cooperative_name TEXT NOT NULL,
  row_number INTEGER,
  full_name TEXT NOT NULL,
  identifier_code TEXT,
  phone TEXT,
  phone2 TEXT,
  cmu_status TEXT,
  cnps_status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les recherches
CREATE INDEX idx_vivriers_members_cooperative ON public.vivriers_members(cooperative_id);
CREATE INDEX idx_vivriers_members_identifier ON public.vivriers_members(identifier_code);
CREATE INDEX idx_vivriers_members_name ON public.vivriers_members(full_name);
CREATE INDEX idx_vivriers_cooperatives_name ON public.vivriers_cooperatives(name);

-- Activer RLS
ALTER TABLE public.vivriers_cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vivriers_members ENABLE ROW LEVEL SECURITY;

-- Politiques RLS - Lecture publique pour données de référence
CREATE POLICY "Anyone can view vivriers cooperatives"
  ON public.vivriers_cooperatives
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage vivriers cooperatives"
  ON public.vivriers_cooperatives
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view vivriers members"
  ON public.vivriers_members
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage vivriers members"
  ON public.vivriers_members
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger pour updated_at
CREATE TRIGGER update_vivriers_cooperatives_updated_at
  BEFORE UPDATE ON public.vivriers_cooperatives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vivriers_members_updated_at
  BEFORE UPDATE ON public.vivriers_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();