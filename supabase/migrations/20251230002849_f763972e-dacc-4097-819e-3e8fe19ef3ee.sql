-- Supprimer les rôles 'user' redondants pour les utilisateurs qui ont déjà un rôle plus spécifique
DELETE FROM user_roles
WHERE role = 'user'
  AND user_id IN (
    SELECT DISTINCT user_id 
    FROM user_roles
    WHERE role IN ('admin', 'agent', 'merchant', 'cooperative')
  );

-- Modifier le trigger handle_new_user pour ne plus créer automatiquement le rôle 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Créer le profil utilisateur
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'full_name', 'Utilisateur'));
    
    -- NE PLUS créer de rôle 'user' automatiquement
    -- Le rôle spécifique sera assigné par assign_merchant_role(), 
    -- assign_agent_role() ou assign_cooperative_role()
    
    RETURN new;
END;
$$;