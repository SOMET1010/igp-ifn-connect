-- Allow authenticated users to self-register as merchant (only for their own user_id)
CREATE POLICY "Users can self-register as merchant"
ON public.merchants
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);