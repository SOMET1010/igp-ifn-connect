-- Politique pour permettre à un utilisateur de créer son propre profil coopérative
CREATE POLICY "Users can create their own cooperative profile"
ON public.cooperatives
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre à un utilisateur de lier son profil coopérative existant
CREATE POLICY "Users can update cooperative to link their profile"
ON public.cooperatives
FOR UPDATE
TO authenticated
USING (user_id IS NULL OR auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre à un utilisateur de créer son propre profil agent
CREATE POLICY "Users can create their own agent profile"
ON public.agents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre à un utilisateur de lier son profil agent existant
CREATE POLICY "Users can update agent to link their profile"
ON public.agents
FOR UPDATE
TO authenticated
USING (user_id IS NULL OR auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);