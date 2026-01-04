-- ==============================================
-- MODULE 1.1 : PROFIL PRODUCTEUR - PNAVIM
-- ==============================================

-- 1. Ajouter le rôle 'producer' à l'enum app_role
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'producer';

-- 2. Table des producteurs
CREATE TABLE public.producers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  region TEXT NOT NULL,
  commune TEXT NOT NULL,
  cooperative_id UUID REFERENCES cooperatives(id),
  specialties TEXT[] DEFAULT '{}',
  igp_certified BOOLEAN DEFAULT false,
  latitude NUMERIC,
  longitude NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(phone)
);

-- 3. Table des récoltes/productions
CREATE TABLE public.producer_harvests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  available_quantity NUMERIC NOT NULL CHECK (available_quantity >= 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price > 0),
  harvest_date DATE NOT NULL,
  expiry_date DATE,
  quality_grade TEXT CHECK (quality_grade IN ('A', 'B', 'C')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'expired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Table des commandes coopérative vers producteur
CREATE TABLE public.cooperative_producer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_id UUID NOT NULL REFERENCES cooperatives(id),
  producer_id UUID NOT NULL REFERENCES producers(id),
  harvest_id UUID REFERENCES producer_harvests(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  delivery_date DATE,
  notes TEXT,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperative_producer_orders ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies pour producers
CREATE POLICY "Admins can manage all producers"
ON public.producers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Producers can view own data"
ON public.producers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Producers can update own data"
ON public.producers FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can self-register as producer"
ON public.producers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cooperatives can view their producers"
ON public.producers FOR SELECT
USING (EXISTS (
  SELECT 1 FROM cooperatives c
  WHERE c.id = producers.cooperative_id AND c.user_id = auth.uid()
));

CREATE POLICY "Agents can view producers"
ON public.producers FOR SELECT
USING (has_role(auth.uid(), 'agent'::app_role));

-- 7. RLS Policies pour producer_harvests
CREATE POLICY "Admins can manage all harvests"
ON public.producer_harvests FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Producers can manage own harvests"
ON public.producer_harvests FOR ALL
USING (EXISTS (
  SELECT 1 FROM producers p
  WHERE p.id = producer_harvests.producer_id AND p.user_id = auth.uid()
));

CREATE POLICY "Cooperatives can view available harvests"
ON public.producer_harvests FOR SELECT
USING (
  status = 'available' AND
  has_role(auth.uid(), 'cooperative'::app_role)
);

CREATE POLICY "Cooperatives can view harvests from their producers"
ON public.producer_harvests FOR SELECT
USING (EXISTS (
  SELECT 1 FROM producers p
  JOIN cooperatives c ON c.id = p.cooperative_id
  WHERE p.id = producer_harvests.producer_id AND c.user_id = auth.uid()
));

-- 8. RLS Policies pour cooperative_producer_orders
CREATE POLICY "Admins can manage all coop-producer orders"
ON public.cooperative_producer_orders FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Cooperatives can manage own orders"
ON public.cooperative_producer_orders FOR ALL
USING (EXISTS (
  SELECT 1 FROM cooperatives c
  WHERE c.id = cooperative_producer_orders.cooperative_id AND c.user_id = auth.uid()
));

CREATE POLICY "Producers can view orders for them"
ON public.cooperative_producer_orders FOR SELECT
USING (EXISTS (
  SELECT 1 FROM producers p
  WHERE p.id = cooperative_producer_orders.producer_id AND p.user_id = auth.uid()
));

CREATE POLICY "Producers can update order status"
ON public.cooperative_producer_orders FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM producers p
  WHERE p.id = cooperative_producer_orders.producer_id AND p.user_id = auth.uid()
));

-- 9. Indexes pour performance
CREATE INDEX idx_producers_user_id ON public.producers(user_id);
CREATE INDEX idx_producers_cooperative_id ON public.producers(cooperative_id);
CREATE INDEX idx_producer_harvests_producer_id ON public.producer_harvests(producer_id);
CREATE INDEX idx_producer_harvests_product_id ON public.producer_harvests(product_id);
CREATE INDEX idx_producer_harvests_status ON public.producer_harvests(status);
CREATE INDEX idx_coop_producer_orders_cooperative_id ON public.cooperative_producer_orders(cooperative_id);
CREATE INDEX idx_coop_producer_orders_producer_id ON public.cooperative_producer_orders(producer_id);
CREATE INDEX idx_coop_producer_orders_status ON public.cooperative_producer_orders(status);

-- 10. Trigger pour updated_at
CREATE TRIGGER update_producers_updated_at
BEFORE UPDATE ON public.producers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_producer_harvests_updated_at
BEFORE UPDATE ON public.producer_harvests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coop_producer_orders_updated_at
BEFORE UPDATE ON public.cooperative_producer_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();