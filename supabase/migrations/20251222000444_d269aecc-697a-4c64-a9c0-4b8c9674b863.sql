-- Fix security: Block anonymous access to cooperatives
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view cooperatives" ON public.cooperatives;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can view cooperatives"
ON public.cooperatives
FOR SELECT
TO authenticated
USING (true);

-- Fix security: Block anonymous access to stocks  
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view stocks" ON public.stocks;

-- Create a new policy that only allows authenticated users
CREATE POLICY "Authenticated users can view stocks"
ON public.stocks
FOR SELECT
TO authenticated
USING (true);

-- Fix security: Block anonymous access to markets
DROP POLICY IF EXISTS "Anyone can view markets" ON public.markets;

CREATE POLICY "Authenticated users can view markets"
ON public.markets
FOR SELECT
TO authenticated
USING (true);

-- Fix security: Block anonymous access to products
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;

CREATE POLICY "Authenticated users can view products"
ON public.products
FOR SELECT
TO authenticated
USING (true);

-- Fix security: Block anonymous access to product_categories
DROP POLICY IF EXISTS "Anyone can view categories" ON public.product_categories;

CREATE POLICY "Authenticated users can view categories"
ON public.product_categories
FOR SELECT
TO authenticated
USING (true);