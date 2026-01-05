-- Fonction pour lier un merchant à un utilisateur par téléphone
-- Gère tous les cas : création, liaison, transfert contrôlé
CREATE OR REPLACE FUNCTION public.claim_merchant_by_phone(p_phone text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_phone TEXT;
  v_merchant_id UUID;
  v_existing_user_id UUID;
  v_current_user_id UUID;
BEGIN
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  -- Nettoyer le téléphone (garder uniquement les chiffres)
  v_clean_phone := regexp_replace(p_phone, '[^0-9]', '', 'g');
  
  -- Chercher un merchant existant avec ce téléphone
  SELECT id, user_id INTO v_merchant_id, v_existing_user_id
  FROM merchants
  WHERE regexp_replace(phone, '[^0-9]', '', 'g') = v_clean_phone
  LIMIT 1;
  
  IF v_merchant_id IS NULL THEN
    -- Cas 1: Aucun merchant avec ce téléphone - on ne peut pas créer ici
    -- L'inscription se fait via l'agent, pas via login
    RETURN jsonb_build_object('success', false, 'error', 'merchant_not_found', 'message', 'Aucun marchand trouvé avec ce numéro');
  END IF;
  
  IF v_existing_user_id IS NULL THEN
    -- Cas 2: Merchant existe mais pas encore lié à un user
    UPDATE merchants SET user_id = v_current_user_id, updated_at = now()
    WHERE id = v_merchant_id;
  ELSIF v_existing_user_id = v_current_user_id THEN
    -- Cas 3: Déjà lié à cet utilisateur - OK
    NULL;
  ELSE
    -- Cas 4: Lié à un autre utilisateur
    -- Vérifier si l'ancien user a le rôle merchant
    IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = v_existing_user_id AND role = 'merchant') THEN
      -- L'ancien user a le rôle merchant actif - refuser le transfert
      RETURN jsonb_build_object('success', false, 'error', 'phone_already_linked', 'message', 'Ce numéro est déjà lié à un autre compte marchand actif');
    ELSE
      -- L'ancien user n'a pas le rôle merchant - autoriser le transfert
      UPDATE merchants SET user_id = v_current_user_id, updated_at = now()
      WHERE id = v_merchant_id;
    END IF;
  END IF;
  
  -- Assigner le rôle merchant (idempotent)
  INSERT INTO user_roles (user_id, role)
  VALUES (v_current_user_id, 'merchant')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN jsonb_build_object('success', true, 'merchant_id', v_merchant_id);
END;
$$;