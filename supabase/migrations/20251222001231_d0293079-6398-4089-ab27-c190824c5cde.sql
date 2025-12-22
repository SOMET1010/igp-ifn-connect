-- Fix profiles: ensure only authenticated users can access
-- Drop and recreate policies to be explicit about authentication requirement
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate with explicit TO authenticated
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix cooperatives: restrict to admins and owners ONLY (remove merchant access)
DROP POLICY IF EXISTS "Authenticated users can view basic cooperative info" ON public.cooperatives;
DROP POLICY IF EXISTS "Cooperatives can view own data" ON public.cooperatives;

-- Only owners can view their own cooperative data
CREATE POLICY "Cooperatives can view own data" 
ON public.cooperatives 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all (already covered by "Admins can manage cooperatives" policy)
-- But let's ensure there's an explicit SELECT policy for admins
CREATE POLICY "Admins can view all cooperatives" 
ON public.cooperatives 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- For merchants ordering from cooperatives, they need to see cooperative names but NOT contact info
-- We'll create a limited view approach - merchants can only see id, name, code, region, commune
-- This is handled at the application level by selecting only non-sensitive columns
-- The RLS now blocks direct access, so merchants must use a backend function if needed