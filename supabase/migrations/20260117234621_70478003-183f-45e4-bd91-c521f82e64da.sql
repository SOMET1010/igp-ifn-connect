-- Créer le bucket public pour les images produits
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS : lecture publique
CREATE POLICY "Public read product images" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

-- Politique RLS : upload pour utilisateurs authentifiés
CREATE POLICY "Authenticated upload product images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Politique RLS : modification pour utilisateurs authentifiés
CREATE POLICY "Authenticated update product images" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Politique RLS : suppression pour utilisateurs authentifiés
CREATE POLICY "Authenticated delete product images" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);