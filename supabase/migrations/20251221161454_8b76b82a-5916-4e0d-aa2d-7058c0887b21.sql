-- Table des crédits clients pour les marchands
CREATE TABLE public.customer_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  amount_owed numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_credits ENABLE ROW LEVEL SECURITY;

-- Merchants can manage their own customer credits
CREATE POLICY "Merchants can manage own credits"
ON public.customer_credits
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM merchants m
    WHERE m.id = customer_credits.merchant_id
    AND m.user_id = auth.uid()
  )
);

-- Admins can view all credits
CREATE POLICY "Admins can view all credits"
ON public.customer_credits
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_customer_credits_updated_at
BEFORE UPDATE ON public.customer_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Table des promotions
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL,
  product_id uuid,
  min_purchase numeric,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Merchants can manage their own promotions
CREATE POLICY "Merchants can manage own promotions"
ON public.promotions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM merchants m
    WHERE m.id = promotions.merchant_id
    AND m.user_id = auth.uid()
  )
);

-- Admins can view all promotions
CREATE POLICY "Admins can view all promotions"
ON public.promotions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Table des logs système pour l'admin
CREATE TABLE public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  actor_type text,
  actor_id uuid,
  description text,
  metadata jsonb,
  severity text NOT NULL DEFAULT 'info',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view system logs
CREATE POLICY "Admins can view system logs"
ON public.system_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert logs (via service role or triggers)
CREATE POLICY "System can insert logs"
ON public.system_logs
FOR INSERT
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_customer_credits_merchant ON public.customer_credits(merchant_id);
CREATE INDEX idx_customer_credits_status ON public.customer_credits(status);
CREATE INDEX idx_promotions_merchant ON public.promotions(merchant_id);
CREATE INDEX idx_promotions_dates ON public.promotions(start_date, end_date);
CREATE INDEX idx_system_logs_event_type ON public.system_logs(event_type);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);