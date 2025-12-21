-- 1. Agents de démonstration (sans user_id car pas d'utilisateurs auth)
INSERT INTO agents (id, user_id, employee_id, zone, organization, is_active, total_enrollments)
SELECT 
  'a1111111-1111-1111-1111-111111111111'::uuid, 
  id, 
  'AGT-2024-001', 
  'Abidjan Sud', 
  'DGE', 
  true, 
  4
FROM auth.users LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Insérer agents sans user_id (user_id est NOT NULL, donc on doit trouver une autre approche)
-- On va créer les marchands et stocks directement sans agents pour le mode démo

-- 2. Marchands de démonstration (user_id NULL car nullable)
INSERT INTO merchants (id, full_name, phone, activity_type, activity_description, cmu_number, status, market_id, latitude, longitude, rsti_balance, cmu_valid_until)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Fatou Diallo', '+225 07 01 00 01', 'Vivriers', 'Vente d''attiéké et bananes plantain', 'CMU-2024-0001', 'validated', '4b773376-19d0-4620-b082-d80b9e26daa2', 5.3600, -4.0083, 15000, '2025-12-31'),
  ('b2222222-2222-2222-2222-222222222222', 'Amadou Koné', '+225 07 02 00 02', 'Épicerie', 'Épicerie générale et condiments', 'CMU-2024-0002', 'validated', '4b773376-19d0-4620-b082-d80b9e26daa2', 5.3610, -4.0090, 8500, '2025-12-31'),
  ('b3333333-3333-3333-3333-333333333333', 'Mariam Coulibaly', '+225 07 03 00 03', 'Fruits', 'Vente de fruits frais', 'CMU-2024-0003', 'validated', 'ec7c8a45-6f5b-4c20-b828-d9e5a643eabf', 5.3000, -3.9600, 22000, '2025-06-30'),
  ('b4444444-4444-4444-4444-444444444444', 'Kofi Asante', '+225 07 04 00 04', 'Céréales', 'Vente de riz et maïs', 'CMU-2024-0004', 'validated', 'ec7c8a45-6f5b-4c20-b828-d9e5a643eabf', 5.3010, -3.9610, 5000, '2025-12-31'),
  ('b5555555-5555-5555-5555-555555555555', 'Awa Traoré', '+225 07 05 00 05', 'Condiments', 'Piments et oignons', 'CMU-2024-0005', 'validated', 'b594767e-b788-4648-974b-00467ed67241', 5.3500, -3.9900, 12000, '2025-12-31'),
  ('b6666666-6666-6666-6666-666666666666', 'Ibrahim Sanogo', '+225 07 06 00 06', 'Vivriers', 'Manioc et igname', 'CMU-2024-0006', 'validated', 'b594767e-b788-4648-974b-00467ed67241', 5.3510, -3.9910, 3000, '2025-03-31'),
  ('b7777777-7777-7777-7777-777777777777', 'Aminata Bamba', '+225 07 07 00 07', 'Huiles', 'Huile de palme et arachide', 'CMU-2024-0007', 'validated', '638d8ad1-f7f0-433b-a1c1-e9f78cc5eb9b', 5.3300, -4.0500, 18000, '2025-12-31'),
  ('b8888888-8888-8888-8888-888888888888', 'Moussa Diabaté', '+225 07 08 00 08', 'Épicerie', 'Épicerie et boissons', 'CMU-2024-0008', 'pending', '638d8ad1-f7f0-433b-a1c1-e9f78cc5eb9b', 5.3310, -4.0510, 0, NULL),
  ('b9999999-9999-9999-9999-999999999999', 'Fanta Keita', '+225 07 09 00 09', 'Fruits', 'Mangues et ananas', 'CMU-2024-0009', 'pending', '7642d6d6-08f8-49b6-a1f4-1d86d579aa00', 5.4200, -4.0200, 0, NULL),
  ('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sékou Ouattara', '+225 07 10 00 10', 'Céréales', 'Riz local et fonio', 'CMU-2024-0010', 'rejected', '7642d6d6-08f8-49b6-a1f4-1d86d579aa00', 5.4210, -4.0210, 0, NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. Transactions des 30 derniers jours
INSERT INTO transactions (merchant_id, amount, transaction_type, cmu_deduction, rsti_deduction, reference, created_at)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 15000, 'cash', 150, 75, 'TXN-D00001', NOW() - interval '1 day'),
  ('b1111111-1111-1111-1111-111111111111', 8500, 'mobile_money', 85, 43, 'TXN-D00002', NOW() - interval '2 days'),
  ('b1111111-1111-1111-1111-111111111111', 22000, 'cash', 220, 110, 'TXN-D00003', NOW() - interval '3 days'),
  ('b1111111-1111-1111-1111-111111111111', 5000, 'cash', 50, 25, 'TXN-D00004', NOW() - interval '5 days'),
  ('b1111111-1111-1111-1111-111111111111', 12500, 'mobile_money', 125, 63, 'TXN-D00005', NOW() - interval '7 days'),
  ('b1111111-1111-1111-1111-111111111111', 7500, 'cash', 75, 38, 'TXN-D00006', NOW() - interval '10 days'),
  ('b1111111-1111-1111-1111-111111111111', 18000, 'cash', 180, 90, 'TXN-D00007', NOW() - interval '15 days'),
  ('b1111111-1111-1111-1111-111111111111', 9000, 'mobile_money', 90, 45, 'TXN-D00008', NOW() - interval '20 days'),
  ('b2222222-2222-2222-2222-222222222222', 12000, 'cash', 120, 60, 'TXN-D00009', NOW() - interval '1 day'),
  ('b2222222-2222-2222-2222-222222222222', 6500, 'mobile_money', 65, 33, 'TXN-D00010', NOW() - interval '3 days'),
  ('b2222222-2222-2222-2222-222222222222', 15000, 'cash', 150, 75, 'TXN-D00011', NOW() - interval '5 days'),
  ('b2222222-2222-2222-2222-222222222222', 8000, 'cash', 80, 40, 'TXN-D00012', NOW() - interval '8 days'),
  ('b2222222-2222-2222-2222-222222222222', 11000, 'mobile_money', 110, 55, 'TXN-D00013', NOW() - interval '12 days'),
  ('b3333333-3333-3333-3333-333333333333', 25000, 'cash', 250, 125, 'TXN-D00014', NOW() - interval '1 day'),
  ('b3333333-3333-3333-3333-333333333333', 18500, 'mobile_money', 185, 93, 'TXN-D00015', NOW() - interval '2 days'),
  ('b3333333-3333-3333-3333-333333333333', 32000, 'cash', 320, 160, 'TXN-D00016', NOW() - interval '4 days'),
  ('b3333333-3333-3333-3333-333333333333', 14000, 'cash', 140, 70, 'TXN-D00017', NOW() - interval '6 days'),
  ('b3333333-3333-3333-3333-333333333333', 27500, 'mobile_money', 275, 138, 'TXN-D00018', NOW() - interval '9 days'),
  ('b3333333-3333-3333-3333-333333333333', 19000, 'cash', 190, 95, 'TXN-D00019', NOW() - interval '14 days'),
  ('b4444444-4444-4444-4444-444444444444', 8000, 'cash', 80, 40, 'TXN-D00020', NOW() - interval '1 day'),
  ('b4444444-4444-4444-4444-444444444444', 5500, 'mobile_money', 55, 28, 'TXN-D00021', NOW() - interval '4 days'),
  ('b4444444-4444-4444-4444-444444444444', 12000, 'cash', 120, 60, 'TXN-D00022', NOW() - interval '7 days'),
  ('b4444444-4444-4444-4444-444444444444', 7000, 'cash', 70, 35, 'TXN-D00023', NOW() - interval '11 days'),
  ('b5555555-5555-5555-5555-555555555555', 16000, 'cash', 160, 80, 'TXN-D00024', NOW() - interval '1 day'),
  ('b5555555-5555-5555-5555-555555555555', 9500, 'mobile_money', 95, 48, 'TXN-D00025', NOW() - interval '3 days'),
  ('b5555555-5555-5555-5555-555555555555', 21000, 'cash', 210, 105, 'TXN-D00026', NOW() - interval '5 days'),
  ('b5555555-5555-5555-5555-555555555555', 13500, 'cash', 135, 68, 'TXN-D00027', NOW() - interval '8 days'),
  ('b5555555-5555-5555-5555-555555555555', 18000, 'mobile_money', 180, 90, 'TXN-D00028', NOW() - interval '12 days'),
  ('b6666666-6666-6666-6666-666666666666', 7000, 'cash', 70, 35, 'TXN-D00029', NOW() - interval '2 days'),
  ('b6666666-6666-6666-6666-666666666666', 4500, 'mobile_money', 45, 23, 'TXN-D00030', NOW() - interval '5 days'),
  ('b6666666-6666-6666-6666-666666666666', 9000, 'cash', 90, 45, 'TXN-D00031', NOW() - interval '9 days'),
  ('b7777777-7777-7777-7777-777777777777', 28000, 'cash', 280, 140, 'TXN-D00032', NOW() - interval '1 day'),
  ('b7777777-7777-7777-7777-777777777777', 19500, 'mobile_money', 195, 98, 'TXN-D00033', NOW() - interval '3 days'),
  ('b7777777-7777-7777-7777-777777777777', 35000, 'cash', 350, 175, 'TXN-D00034', NOW() - interval '6 days'),
  ('b7777777-7777-7777-7777-777777777777', 22000, 'cash', 220, 110, 'TXN-D00035', NOW() - interval '10 days'),
  ('b7777777-7777-7777-7777-777777777777', 31000, 'mobile_money', 310, 155, 'TXN-D00036', NOW() - interval '15 days');

-- 4. Stocks marchands
INSERT INTO merchant_stocks (merchant_id, product_id, quantity, unit_price, min_threshold, last_restocked_at)
VALUES
  ('b1111111-1111-1111-1111-111111111111', '53191a7e-99f2-40cb-bae2-00471c2076f9', 25, 500, 10, NOW() - interval '3 days'),
  ('b1111111-1111-1111-1111-111111111111', '161cc379-5536-44fc-a50a-6731922a0733', 40, 300, 15, NOW() - interval '5 days'),
  ('b1111111-1111-1111-1111-111111111111', 'c9d01f2f-a09c-49ae-bd18-437010f7401d', 8, 200, 10, NOW() - interval '7 days'),
  ('b2222222-2222-2222-2222-222222222222', '3f653f96-62bd-43cc-b6f6-dccd222b6d5c', 50, 850, 20, NOW() - interval '2 days'),
  ('b2222222-2222-2222-2222-222222222222', 'c597f25d-6bc3-44fc-a701-bce46ddebfc2', 15, 1500, 5, NOW() - interval '4 days'),
  ('b2222222-2222-2222-2222-222222222222', '06c6a32f-ec96-4580-b450-fd00962c74fc', 3, 1000, 5, NOW() - interval '10 days'),
  ('b3333333-3333-3333-3333-333333333333', '6e4b6ab5-aec0-4f29-b2af-c059955aef81', 30, 250, 10, NOW() - interval '1 day'),
  ('b3333333-3333-3333-3333-333333333333', '161cc379-5536-44fc-a50a-6731922a0733', 60, 350, 20, NOW() - interval '2 days'),
  ('b4444444-4444-4444-4444-444444444444', '3f653f96-62bd-43cc-b6f6-dccd222b6d5c', 100, 800, 30, NOW() - interval '1 day'),
  ('b4444444-4444-4444-4444-444444444444', 'f775db86-ca94-4a1f-9b62-f441c52b34ac', 45, 600, 15, NOW() - interval '3 days'),
  ('b5555555-5555-5555-5555-555555555555', '06c6a32f-ec96-4580-b450-fd00962c74fc', 20, 800, 8, NOW() - interval '2 days'),
  ('b5555555-5555-5555-5555-555555555555', '53735565-034d-4021-b326-47853fb57939', 35, 400, 12, NOW() - interval '4 days'),
  ('b5555555-5555-5555-5555-555555555555', '6e4b6ab5-aec0-4f29-b2af-c059955aef81', 4, 300, 8, NOW() - interval '6 days');

-- 5. Stocks coopératives
INSERT INTO stocks (cooperative_id, product_id, quantity, unit_price, lot_number, harvest_date, expiry_date)
VALUES
  ('ab175346-7e25-4821-af18-444fabac0b96', '53191a7e-99f2-40cb-bae2-00471c2076f9', 500, 400, 'LOT-ATT-2024-001', '2024-11-15', '2025-02-15'),
  ('ab175346-7e25-4821-af18-444fabac0b96', 'c9d01f2f-a09c-49ae-bd18-437010f7401d', 800, 150, 'LOT-MAN-2024-002', '2024-11-20', '2025-03-20'),
  ('6476d54f-306e-4d22-aeb9-bd780e25a135', '161cc379-5536-44fc-a50a-6731922a0733', 1200, 250, 'LOT-BAN-2024-001', '2024-12-01', '2025-01-15'),
  ('6476d54f-306e-4d22-aeb9-bd780e25a135', 'f7bcd487-bf3b-4d61-b203-d3cb08079fa7', 600, 500, 'LOT-IGN-2024-001', '2024-11-25', '2025-04-25'),
  ('c8113182-e96a-46a4-ba69-58a2307cff18', '3f653f96-62bd-43cc-b6f6-dccd222b6d5c', 2000, 750, 'LOT-RIZ-2024-001', '2024-10-30', '2025-10-30'),
  ('ef06bc5f-ab7b-44c0-b870-f31c05c1f860', '9ecf3afb-5797-4a4d-87d5-67ac4e9b1567', 350, 2500, 'LOT-CAC-2024-001', '2024-11-10', '2026-11-10'),
  ('dc15608f-125e-4026-b74a-4b3c2e1f9b6b', 'c597f25d-6bc3-44fc-a701-bce46ddebfc2', 400, 1200, 'LOT-HPL-2024-001', '2024-12-05', '2025-12-05');

-- 6. Crédits clients
INSERT INTO customer_credits (merchant_id, customer_name, customer_phone, amount_owed, amount_paid, status, due_date, notes)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Mme Koffi', '+225 07 11 22 33', 5000, 2000, 'partial', '2025-01-15', 'Paiement partiel reçu'),
  ('b1111111-1111-1111-1111-111111111111', 'M. Yao', '+225 07 22 33 44', 3500, 0, 'pending', '2025-01-10', 'Achat attiéké'),
  ('b2222222-2222-2222-2222-222222222222', 'Famille Touré', '+225 07 33 44 55', 12000, 12000, 'paid', '2024-12-20', 'Payé intégralement'),
  ('b3333333-3333-3333-3333-333333333333', 'Restaurant Chez Awa', '+225 07 44 55 66', 25000, 10000, 'partial', '2025-01-20', 'Client régulier'),
  ('b5555555-5555-5555-5555-555555555555', 'M. Diarra', '+225 07 55 66 77', 8000, 0, 'pending', '2025-01-05', 'Crédit condiments');