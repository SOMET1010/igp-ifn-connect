-- 1. Lier les utilisateurs auth existants à leurs merchants via le pattern email
-- Email format: {phone}@marchand.igp.ci
UPDATE merchants m
SET user_id = u.id
FROM auth.users u
WHERE u.email LIKE '%@marchand.igp.ci'
  AND m.user_id IS NULL
  AND REPLACE(m.phone, ' ', '') = REPLACE(REPLACE(SPLIT_PART(u.email, '@', 1), '+225', ''), ' ', '');

-- 2. Lier les utilisateurs auth existants à leurs agents via le pattern email  
-- Email format: {employee_id}@agent.igp.ci
UPDATE agents a
SET user_id = u.id
FROM auth.users u
WHERE u.email LIKE '%@agent.igp.ci'
  AND a.user_id IS NULL
  AND LOWER(a.employee_id) = LOWER(SPLIT_PART(u.email, '@', 1));

-- 3. Lier les utilisateurs auth existants à leurs coopératives via le pattern email
-- Email format: {code}@cooperative.igp.ci
UPDATE cooperatives c
SET user_id = u.id
FROM auth.users u
WHERE u.email LIKE '%@cooperative.igp.ci'
  AND c.user_id IS NULL
  AND LOWER(c.code) = LOWER(SPLIT_PART(u.email, '@', 1));

-- 4. Assigner le rôle 'merchant' aux utilisateurs liés à un merchant sans ce rôle
INSERT INTO user_roles (user_id, role)
SELECT m.user_id, 'merchant'::app_role
FROM merchants m
WHERE m.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = m.user_id 
      AND ur.role = 'merchant'
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Assigner le rôle 'agent' aux utilisateurs liés à un agent sans ce rôle
INSERT INTO user_roles (user_id, role)
SELECT a.user_id, 'agent'::app_role
FROM agents a
WHERE a.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = a.user_id 
      AND ur.role = 'agent'
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Assigner le rôle 'cooperative' aux utilisateurs liés à une coopérative sans ce rôle
INSERT INTO user_roles (user_id, role)
SELECT c.user_id, 'cooperative'::app_role
FROM cooperatives c
WHERE c.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = c.user_id 
      AND ur.role = 'cooperative'
  )
ON CONFLICT (user_id, role) DO NOTHING;