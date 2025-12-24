-- Create transaction_items table to link transactions to products sold
CREATE TABLE public.transaction_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Create policy for merchants to manage their own transaction items
CREATE POLICY "Merchants can manage own transaction items"
ON public.transaction_items
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM transactions t
        JOIN merchants m ON m.id = t.merchant_id
        WHERE t.id = transaction_items.transaction_id
        AND m.user_id = auth.uid()
    )
);

-- Create policy for admins to view all transaction items
CREATE POLICY "Admins can view all transaction items"
ON public.transaction_items
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_transaction_items_transaction_id ON public.transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id ON public.transaction_items(product_id);