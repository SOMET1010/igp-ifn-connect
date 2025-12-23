-- Create a function to get merchant's today total sales (server-side aggregation)
CREATE OR REPLACE FUNCTION public.get_merchant_today_total(_merchant_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(SUM(amount), 0) 
  FROM transactions 
  WHERE merchant_id = _merchant_id 
    AND created_at >= CURRENT_DATE;
$$;