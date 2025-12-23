-- =====================================================
-- Fonctions SECURITY DEFINER pour l'attribution des rôles
-- =====================================================

-- 1. Fonction pour assigner le rôle merchant
CREATE OR REPLACE FUNCTION public.assign_merchant_role(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'utilisateur appelle pour lui-même
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Cannot assign role to another user';
  END IF;
  
  -- Vérifier qu'un merchant existe pour cet user_id
  IF NOT EXISTS (SELECT 1 FROM merchants WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'User must be a registered merchant';
  END IF;
  
  -- Insérer le rôle (ignorer si déjà existant)
  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, 'merchant')
  ON CONFLICT DO NOTHING;
END;
$$;

-- 2. Fonction pour assigner le rôle agent
CREATE OR REPLACE FUNCTION public.assign_agent_role(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Cannot assign role to another user';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM agents WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'User must be a registered agent';
  END IF;
  
  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, 'agent')
  ON CONFLICT DO NOTHING;
END;
$$;

-- 3. Fonction pour assigner le rôle cooperative
CREATE OR REPLACE FUNCTION public.assign_cooperative_role(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Cannot assign role to another user';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM cooperatives WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'User must be a registered cooperative';
  END IF;
  
  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, 'cooperative')
  ON CONFLICT DO NOTHING;
END;
$$;

-- =====================================================
-- Correction des utilisateurs existants sans rôle
-- =====================================================

-- Ajouter le rôle merchant aux marchands existants
INSERT INTO user_roles (user_id, role)
SELECT m.user_id, 'merchant'::app_role
FROM merchants m
WHERE m.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = m.user_id AND ur.role = 'merchant'
  );

-- Ajouter le rôle agent aux agents existants
INSERT INTO user_roles (user_id, role)
SELECT a.user_id, 'agent'::app_role
FROM agents a
WHERE a.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = a.user_id AND ur.role = 'agent'
  );

-- Ajouter le rôle cooperative aux coopératives existantes
INSERT INTO user_roles (user_id, role)
SELECT c.user_id, 'cooperative'::app_role
FROM cooperatives c
WHERE c.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = c.user_id AND ur.role = 'cooperative'
  );