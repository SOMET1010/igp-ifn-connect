-- Create merchant_stocks table
CREATE TABLE public.merchant_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  min_threshold NUMERIC DEFAULT 5,
  unit_price NUMERIC,
  last_restocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(merchant_id, product_id)
);

-- Enable RLS
ALTER TABLE public.merchant_stocks ENABLE ROW LEVEL SECURITY;

-- Policy: Merchants can manage their own stocks
CREATE POLICY "Merchants can manage own stocks"
ON public.merchant_stocks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM merchants m 
    WHERE m.id = merchant_stocks.merchant_id 
    AND m.user_id = auth.uid()
  )
);

-- Policy: Admins can manage all stocks
CREATE POLICY "Admins can manage all stocks"
ON public.merchant_stocks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_merchant_stocks_updated_at
BEFORE UPDATE ON public.merchant_stocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();