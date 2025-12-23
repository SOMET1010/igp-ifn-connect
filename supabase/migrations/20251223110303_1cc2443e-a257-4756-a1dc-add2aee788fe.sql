-- Fonction RPC pour calculer la somme des transactions côté serveur
-- Évite de télécharger toutes les transactions au client
CREATE OR REPLACE FUNCTION get_total_transactions_amount()
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(amount), 0) FROM transactions;
$$;