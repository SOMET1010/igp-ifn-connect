-- Create invoices table for FNE (Facture Normalisée Électronique)
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  transaction_id uuid REFERENCES public.transactions(id),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id),
  
  -- Customer info (optional)
  customer_name text,
  customer_phone text,
  customer_ncc text,
  
  -- Invoice amounts
  amount_ht numeric NOT NULL,
  tva_rate numeric DEFAULT 0,
  tva_amount numeric DEFAULT 0,
  amount_ttc numeric NOT NULL,
  
  -- DGI metadata
  qr_code_data text,
  signature_hash text,
  
  -- Status
  status text DEFAULT 'issued',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  cancelled_at timestamp with time zone,
  cancellation_reason text
);

-- Add columns to merchants for FNE
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS ncc text,
ADD COLUMN IF NOT EXISTS fiscal_regime text DEFAULT 'TSU',
ADD COLUMN IF NOT EXISTS invoice_counter integer DEFAULT 0;

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policies for invoices
CREATE POLICY "Merchants can manage own invoices"
ON public.invoices
FOR ALL
USING (EXISTS (
  SELECT 1 FROM merchants m
  WHERE m.id = invoices.merchant_id AND m.user_id = auth.uid()
));

CREATE POLICY "Admins can view all invoices"
ON public.invoices
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));