-- Politique UPDATE pour permettre aux utilisateurs de réclamer un merchant sans user_id
CREATE POLICY "Users can claim unassigned merchant"
ON public.merchants
FOR UPDATE
TO authenticated
USING (user_id IS NULL)
WITH CHECK (auth.uid() = user_id);

-- Politique UPDATE pour permettre aux utilisateurs de réclamer un agent sans user_id
CREATE POLICY "Users can claim unassigned agent"
ON public.agents
FOR UPDATE
TO authenticated
USING (user_id IS NULL)
WITH CHECK (auth.uid() = user_id);

-- Politique UPDATE pour permettre aux utilisateurs de réclamer une coopérative sans user_id
CREATE POLICY "Users can claim unassigned cooperative"
ON public.cooperatives
FOR UPDATE
TO authenticated
USING (user_id IS NULL)
WITH CHECK (auth.uid() = user_id);