-- Add UPDATE policy for cooperatives to allow owners to update their own data
CREATE POLICY "Cooperatives can update own data"
ON public.cooperatives
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);