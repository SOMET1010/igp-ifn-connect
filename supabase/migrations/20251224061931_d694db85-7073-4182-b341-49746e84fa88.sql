-- Permettre aux agents de modifier leurs propres données (zone uniquement)
CREATE POLICY "Agents can update own data" ON agents
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);