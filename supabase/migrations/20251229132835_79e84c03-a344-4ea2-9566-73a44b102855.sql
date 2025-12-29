-- Ajouter la politique INSERT pour permettre aux marchands d'insérer leurs propres paiements CMU
CREATE POLICY "Merchants can insert own CMU payments"
ON public.cmu_payments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM merchants m
    WHERE m.id = cmu_payments.merchant_id
    AND m.user_id = auth.uid()
  )
);