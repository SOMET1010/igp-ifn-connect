-- Migration: Ajout support import cartes P.NA.VIM
-- Ajouter colonne market_code si manquante
ALTER TABLE vivriers_members ADD COLUMN IF NOT EXISTS market_code TEXT;

-- Index pour recherche rapide par market_code
CREATE INDEX IF NOT EXISTS idx_vivriers_members_market_code ON vivriers_members(market_code);

-- Index pour recherche par identifier_code (supporte lettres)
CREATE INDEX IF NOT EXISTS idx_vivriers_members_identifier ON vivriers_members(identifier_code);

-- Index pour recherche par nom (full-text like)
CREATE INDEX IF NOT EXISTS idx_vivriers_members_fullname ON vivriers_members(full_name);

-- Index pour recherche par téléphone
CREATE INDEX IF NOT EXISTS idx_vivriers_members_phone ON vivriers_members(phone);