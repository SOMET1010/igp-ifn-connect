-- Créer le bucket pour les photos marchands
INSERT INTO storage.buckets (id, name, public)
VALUES ('merchant-photos', 'merchant-photos', true);

-- Politique RLS : Agents authentifiés peuvent uploader
CREATE POLICY "Agents can upload merchant photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'merchant-photos' AND
  public.has_role(auth.uid(), 'agent')
);

-- Politique RLS : Lecture publique des photos
CREATE POLICY "Public can view merchant photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'merchant-photos');

-- Politique RLS : Agents peuvent supprimer leurs uploads
CREATE POLICY "Agents can delete merchant photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'merchant-photos' AND
  public.has_role(auth.uid(), 'agent')
);