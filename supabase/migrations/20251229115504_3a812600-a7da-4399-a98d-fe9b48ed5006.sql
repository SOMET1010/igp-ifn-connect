-- 1. Associer la coopérative "Savane du Nord" à un utilisateur existant
UPDATE cooperatives 
SET user_id = '19030680-16fd-4754-a258-c1dd94a1aa2d'
WHERE id = 'ab175346-7e25-4821-af18-444fabac0b96';

-- 2. Ajouter le rôle cooperative à cet utilisateur
INSERT INTO user_roles (user_id, role)
VALUES ('19030680-16fd-4754-a258-c1dd94a1aa2d', 'cooperative')
ON CONFLICT DO NOTHING;

-- 3. Créer des commandes de test pour cette coopérative
-- Commande 1: En attente (aujourd'hui)
INSERT INTO orders (cooperative_id, merchant_id, product_id, quantity, unit_price, total_amount, status, created_at)
VALUES (
  'ab175346-7e25-4821-af18-444fabac0b96',
  '6ae408c1-0eb8-4583-a0a3-dca6f0677088',
  '53191a7e-99f2-40cb-bae2-00471c2076f9',
  50,
  1500,
  75000,
  'pending',
  NOW()
);

-- Commande 2: Confirmée (hier)
INSERT INTO orders (cooperative_id, merchant_id, product_id, quantity, unit_price, total_amount, status, created_at)
VALUES (
  'ab175346-7e25-4821-af18-444fabac0b96',
  '6ae408c1-0eb8-4583-a0a3-dca6f0677088',
  '161cc379-5536-44fc-a50a-6731922a0733',
  100,
  800,
  80000,
  'confirmed',
  NOW() - INTERVAL '1 day'
);

-- Commande 3: En transit (il y a 2 jours)
INSERT INTO orders (cooperative_id, merchant_id, product_id, quantity, unit_price, total_amount, status, created_at)
VALUES (
  'ab175346-7e25-4821-af18-444fabac0b96',
  '6ae408c1-0eb8-4583-a0a3-dca6f0677088',
  'f7bcd487-bf3b-4d61-b203-d3cb08079fa7',
  200,
  600,
  120000,
  'in_transit',
  NOW() - INTERVAL '2 days'
);

-- Commande 4: Livrée (il y a 3 jours)
INSERT INTO orders (cooperative_id, merchant_id, product_id, quantity, unit_price, total_amount, status, created_at)
VALUES (
  'ab175346-7e25-4821-af18-444fabac0b96',
  '6ae408c1-0eb8-4583-a0a3-dca6f0677088',
  '53191a7e-99f2-40cb-bae2-00471c2076f9',
  75,
  1500,
  112500,
  'delivered',
  NOW() - INTERVAL '3 days'
);

-- Commande 5: Livrée (il y a 5 jours)
INSERT INTO orders (cooperative_id, merchant_id, product_id, quantity, unit_price, total_amount, status, created_at)
VALUES (
  'ab175346-7e25-4821-af18-444fabac0b96',
  '6ae408c1-0eb8-4583-a0a3-dca6f0677088',
  '161cc379-5536-44fc-a50a-6731922a0733',
  150,
  800,
  120000,
  'delivered',
  NOW() - INTERVAL '5 days'
);

-- Commande 6: Livrée (il y a 6 jours)
INSERT INTO orders (cooperative_id, merchant_id, product_id, quantity, unit_price, total_amount, status, created_at)
VALUES (
  'ab175346-7e25-4821-af18-444fabac0b96',
  '6ae408c1-0eb8-4583-a0a3-dca6f0677088',
  'f7bcd487-bf3b-4d61-b203-d3cb08079fa7',
  80,
  600,
  48000,
  'delivered',
  NOW() - INTERVAL '6 days'
);

-- 4. Activer REPLICA IDENTITY pour le realtime (la table est déjà dans la publication)
ALTER TABLE orders REPLICA IDENTITY FULL;