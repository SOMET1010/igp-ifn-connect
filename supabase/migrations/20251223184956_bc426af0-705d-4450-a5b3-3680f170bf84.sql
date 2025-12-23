-- Assigner tous les marchands orphelins à l'agent de démo AGT-2024-001
UPDATE public.merchants 
SET enrolled_by = 'a1111111-1111-1111-1111-111111111111'
WHERE enrolled_by IS NULL;