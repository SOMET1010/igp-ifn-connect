-- Drop the existing restrictive policy for authenticated users viewing markets
DROP POLICY IF EXISTS "Authenticated users can view markets" ON public.markets;

-- Create a PERMISSIVE policy allowing anyone (including anonymous) to view markets
CREATE POLICY "Anyone can view markets" 
ON public.markets 
FOR SELECT 
USING (true);