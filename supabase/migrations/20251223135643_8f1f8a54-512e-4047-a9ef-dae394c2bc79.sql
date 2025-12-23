
-- Créer les merchants manquants pour les utilisateurs auth existants
-- et les lier à leurs user_ids avec le rôle merchant

-- 1. Créer un merchant pour 01050858@marchand.igp.ci
INSERT INTO merchants (
  phone, 
  full_name, 
  cmu_number, 
  activity_type, 
  status, 
  user_id
)
VALUES (
  '01050858',
  'Marchand 01050858',
  'CMU-01050858',
  'Commerce général',
  'validated',
  'fc33340e-d599-4fd7-b1cc-9f8691a3c2d9'
);

-- 2. Créer un merchant pour 0140984943@marchand.igp.ci
INSERT INTO merchants (
  phone, 
  full_name, 
  cmu_number, 
  activity_type, 
  status, 
  user_id
)
VALUES (
  '0140984943',
  'Marchand 0140984943',
  'CMU-0140984943',
  'Commerce général',
  'validated',
  'f18d0218-cac1-4bde-bfe4-b94454a70269'
);

-- 3. Créer un merchant pour 0759498436@marchand.igp.ci
INSERT INTO merchants (
  phone, 
  full_name, 
  cmu_number, 
  activity_type, 
  status, 
  user_id
)
VALUES (
  '0759498436',
  'Marchand 0759498436',
  'CMU-0759498436',
  'Commerce général',
  'validated',
  '2f98d6fc-a91e-4c94-8526-ab4855961014'
);

-- 4. Assigner le rôle 'merchant' aux 3 utilisateurs (ignorer si déjà existant)
INSERT INTO user_roles (user_id, role)
VALUES 
  ('fc33340e-d599-4fd7-b1cc-9f8691a3c2d9', 'merchant'),
  ('f18d0218-cac1-4bde-bfe4-b94454a70269', 'merchant'),
  ('2f98d6fc-a91e-4c94-8526-ab4855961014', 'merchant')
ON CONFLICT (user_id, role) DO NOTHING;
