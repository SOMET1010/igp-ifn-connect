-- Supprimer les tables liées au profil client (hors périmètre PNAVIM)
DROP TABLE IF EXISTS client_transactions CASCADE;
DROP TABLE IF EXISTS client_services CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS financial_services CASCADE;