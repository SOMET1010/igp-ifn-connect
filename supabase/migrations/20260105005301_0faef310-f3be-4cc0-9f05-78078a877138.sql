-- Attribution du rôle admin à patrick.somet@ansut.ci
INSERT INTO public.user_roles (user_id, role)
VALUES ('20e200e5-30af-45bf-9b93-e418809a0b8c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;