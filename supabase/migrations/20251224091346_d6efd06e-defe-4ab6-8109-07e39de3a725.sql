-- Fonction pour décrémenter le stock de façon sécurisée
CREATE OR REPLACE FUNCTION public.decrement_stock(p_stock_id uuid, p_quantity numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE stocks 
  SET quantity = quantity - p_quantity,
      updated_at = now()
  WHERE id = p_stock_id AND quantity >= p_quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock insuffisant ou stock introuvable';
  END IF;
END;
$$;

-- Activer le realtime sur la table orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;