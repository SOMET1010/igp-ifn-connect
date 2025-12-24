-- Allow authenticated users to self-register as a cooperative
CREATE POLICY "Users can self-register as cooperative"
ON public.cooperatives
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);