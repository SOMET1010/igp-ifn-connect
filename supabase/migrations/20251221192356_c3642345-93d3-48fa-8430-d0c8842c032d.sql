-- ============================================
-- DONNÉES DE DÉMONSTRATION POUR TESTS IFN
-- ============================================

-- 1. Créer les marchés de test additionnels
INSERT INTO public.markets (id, name, commune, region, latitude, longitude)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Marché d''Adjamé', 'Adjamé', 'Abidjan', 5.3547, -4.0267),
  ('22222222-2222-2222-2222-222222222222', 'Marché de Treichville', 'Treichville', 'Abidjan', 5.2982, -3.9999),
  ('33333333-3333-3333-3333-333333333333', 'Marché de Cocody', 'Cocody', 'Abidjan', 5.3433, -3.9881)
ON CONFLICT (id) DO NOTHING;

-- 2. Ajouter des catégories de produits avec UUIDs valides
INSERT INTO public.product_categories (id, name, icon, color)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Fruits', '🍎', '#22c55e'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Légumes', '🥬', '#16a34a'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Céréales', '🌾', '#eab308'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Tubercules', '🥔', '#a16207')
ON CONFLICT (id) DO NOTHING;

-- 3. Ajouter des produits de test
INSERT INTO public.products (id, name, unit, is_igp, category_id)
VALUES 
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'Attiéké', 'kg', true, 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('22222222-aaaa-aaaa-aaaa-222222222222', 'Banane Plantain', 'kg', true, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('33333333-aaaa-aaaa-aaaa-333333333333', 'Manioc', 'kg', false, 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('44444444-aaaa-aaaa-aaaa-444444444444', 'Tomate', 'kg', false, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('55555555-aaaa-aaaa-aaaa-555555555555', 'Oignon', 'kg', false, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('66666666-aaaa-aaaa-aaaa-666666666666', 'Piment', 'kg', false, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('77777777-aaaa-aaaa-aaaa-777777777777', 'Igname', 'kg', true, 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('88888888-aaaa-aaaa-aaaa-888888888888', 'Riz Local', 'kg', true, 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT (id) DO NOTHING;