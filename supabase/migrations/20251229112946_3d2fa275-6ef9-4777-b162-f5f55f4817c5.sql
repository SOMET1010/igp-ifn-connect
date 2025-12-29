-- Table pour gérer les sessions journalières des marchands
CREATE TABLE public.merchant_daily_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  opening_cash NUMERIC NOT NULL DEFAULT 0,
  closing_cash NUMERIC,
  expected_cash NUMERIC,
  cash_difference NUMERIC,
  total_sales NUMERIC DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Une seule session ouverte par marchand par jour
  CONSTRAINT unique_merchant_session_per_day UNIQUE (merchant_id, session_date)
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_merchant_sessions_merchant ON public.merchant_daily_sessions(merchant_id);
CREATE INDEX idx_merchant_sessions_date ON public.merchant_daily_sessions(session_date DESC);
CREATE INDEX idx_merchant_sessions_status ON public.merchant_daily_sessions(status) WHERE status = 'open';

-- Enable RLS
ALTER TABLE public.merchant_daily_sessions ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Merchants can view own sessions"
ON public.merchant_daily_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM merchants m
    WHERE m.id = merchant_daily_sessions.merchant_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Merchants can create own sessions"
ON public.merchant_daily_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM merchants m
    WHERE m.id = merchant_daily_sessions.merchant_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Merchants can update own sessions"
ON public.merchant_daily_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM merchants m
    WHERE m.id = merchant_daily_sessions.merchant_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all sessions"
ON public.merchant_daily_sessions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger pour updated_at
CREATE TRIGGER update_merchant_daily_sessions_updated_at
BEFORE UPDATE ON public.merchant_daily_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();