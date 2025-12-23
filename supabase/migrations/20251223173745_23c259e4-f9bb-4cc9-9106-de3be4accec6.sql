-- ============================================
-- PHASE 1: SCHÉMA RBAC COMPLET
-- ============================================

-- 1. Table des Directions/Services (structure organisationnelle)
CREATE TABLE public.directions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    code text UNIQUE NOT NULL,
    description text,
    parent_id uuid REFERENCES public.directions(id) ON DELETE SET NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Table des Ressources/Modules
CREATE TABLE public.rbac_resources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    label text NOT NULL,
    category text,
    icon text,
    description text,
    display_order int DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 3. Table des Actions
CREATE TABLE public.rbac_actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    label text NOT NULL,
    description text,
    icon text,
    display_order int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 4. Table des Portées
CREATE TABLE public.rbac_scopes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    label text NOT NULL,
    description text,
    display_order int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 5. Table des Profils (Roles)
CREATE TABLE public.rbac_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    default_scope_id uuid REFERENCES public.rbac_scopes(id),
    is_system boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 6. Table des Permissions (Matrice profil × ressource × action)
CREATE TABLE public.profile_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.rbac_profiles(id) ON DELETE CASCADE,
    resource_id uuid NOT NULL REFERENCES public.rbac_resources(id) ON DELETE CASCADE,
    action_id uuid NOT NULL REFERENCES public.rbac_actions(id) ON DELETE CASCADE,
    scope_id uuid REFERENCES public.rbac_scopes(id),
    field_restrictions jsonb DEFAULT '{}',
    status_restrictions jsonb DEFAULT '[]',
    is_enabled boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(profile_id, resource_id, action_id)
);

-- 7. Table d'association Utilisateur ↔ Profils RBAC
CREATE TABLE public.user_rbac_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    profile_id uuid NOT NULL REFERENCES public.rbac_profiles(id) ON DELETE CASCADE,
    direction_id uuid REFERENCES public.directions(id) ON DELETE SET NULL,
    assigned_at timestamptz DEFAULT now(),
    assigned_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    is_active boolean DEFAULT true,
    UNIQUE(user_id, profile_id)
);

-- 8. Table d'audit RBAC
CREATE TABLE public.rbac_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    old_data jsonb,
    new_data jsonb,
    performed_by uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    performed_at timestamptz DEFAULT now(),
    ip_address text,
    user_agent text
);

-- ============================================
-- TRIGGERS pour updated_at
-- ============================================

CREATE TRIGGER update_directions_updated_at
    BEFORE UPDATE ON public.directions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rbac_profiles_updated_at
    BEFORE UPDATE ON public.rbac_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profile_permissions_updated_at
    BEFORE UPDATE ON public.profile_permissions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FONCTIONS RPC SÉCURISÉES
-- ============================================

-- Fonction pour vérifier une permission spécifique
CREATE OR REPLACE FUNCTION public.check_rbac_permission(
    _user_id uuid,
    _resource_code text,
    _action_code text
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM user_rbac_profiles urp
        JOIN rbac_profiles rp ON rp.id = urp.profile_id AND rp.is_active = true
        JOIN profile_permissions pp ON pp.profile_id = urp.profile_id AND pp.is_enabled = true
        JOIN rbac_resources r ON r.id = pp.resource_id AND r.is_active = true
        JOIN rbac_actions a ON a.id = pp.action_id
        WHERE urp.user_id = _user_id
        AND urp.is_active = true
        AND r.code = _resource_code
        AND a.code = _action_code
    )
$$;

-- Fonction pour récupérer toutes les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_rbac_permissions(_user_id uuid)
RETURNS TABLE(
    resource_code text,
    resource_label text,
    action_code text,
    action_label text,
    scope_code text,
    scope_label text,
    field_restrictions jsonb,
    status_restrictions jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT DISTINCT 
        r.code as resource_code,
        r.label as resource_label,
        a.code as action_code,
        a.label as action_label,
        COALESCE(s.code, 'self') as scope_code,
        COALESCE(s.label, 'Moi') as scope_label,
        pp.field_restrictions,
        pp.status_restrictions
    FROM user_rbac_profiles urp
    JOIN rbac_profiles rp ON rp.id = urp.profile_id AND rp.is_active = true
    JOIN profile_permissions pp ON pp.profile_id = urp.profile_id AND pp.is_enabled = true
    JOIN rbac_resources r ON r.id = pp.resource_id AND r.is_active = true
    JOIN rbac_actions a ON a.id = pp.action_id
    LEFT JOIN rbac_scopes s ON s.id = pp.scope_id
    WHERE urp.user_id = _user_id
    AND urp.is_active = true
    ORDER BY r.code, a.code
$$;

-- Fonction pour récupérer les profils d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_rbac_profiles(_user_id uuid)
RETURNS TABLE(
    profile_id uuid,
    profile_name text,
    profile_description text,
    direction_id uuid,
    direction_name text,
    assigned_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        rp.id as profile_id,
        rp.name as profile_name,
        rp.description as profile_description,
        d.id as direction_id,
        d.name as direction_name,
        urp.assigned_at
    FROM user_rbac_profiles urp
    JOIN rbac_profiles rp ON rp.id = urp.profile_id
    LEFT JOIN directions d ON d.id = urp.direction_id
    WHERE urp.user_id = _user_id
    AND urp.is_active = true
    AND rp.is_active = true
    ORDER BY urp.assigned_at DESC
$$;

-- Fonction pour vérifier si un utilisateur est super admin RBAC
CREATE OR REPLACE FUNCTION public.is_rbac_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM user_rbac_profiles urp
        JOIN rbac_profiles rp ON rp.id = urp.profile_id
        WHERE urp.user_id = _user_id
        AND urp.is_active = true
        AND rp.is_active = true
        AND rp.name = 'Super Admin'
    )
    OR public.has_role(_user_id, 'admin')
$$;

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.directions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rbac_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Directions: lecture pour tous les authentifiés, gestion pour admins
CREATE POLICY "Authenticated users can view directions"
ON public.directions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage directions"
ON public.directions FOR ALL
TO authenticated
USING (public.is_rbac_admin(auth.uid()));

-- Resources: lecture pour tous, gestion pour admins
CREATE POLICY "Authenticated users can view resources"
ON public.rbac_resources FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage resources"
ON public.rbac_resources FOR ALL
TO authenticated
USING (public.is_rbac_admin(auth.uid()));

-- Actions: lecture pour tous, gestion pour admins
CREATE POLICY "Authenticated users can view actions"
ON public.rbac_actions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage actions"
ON public.rbac_actions FOR ALL
TO authenticated
USING (public.is_rbac_admin(auth.uid()));

-- Scopes: lecture pour tous, gestion pour admins
CREATE POLICY "Authenticated users can view scopes"
ON public.rbac_scopes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage scopes"
ON public.rbac_scopes FOR ALL
TO authenticated
USING (public.is_rbac_admin(auth.uid()));

-- Profiles: lecture pour tous, gestion pour admins
CREATE POLICY "Authenticated users can view profiles"
ON public.rbac_profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage profiles"
ON public.rbac_profiles FOR ALL
TO authenticated
USING (public.is_rbac_admin(auth.uid()));

-- Permissions: lecture pour admins et propres permissions
CREATE POLICY "Users can view own permissions"
ON public.profile_permissions FOR SELECT
TO authenticated
USING (
    public.is_rbac_admin(auth.uid())
    OR EXISTS (
        SELECT 1 FROM user_rbac_profiles urp
        WHERE urp.profile_id = profile_permissions.profile_id
        AND urp.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage permissions"
ON public.profile_permissions FOR ALL
TO authenticated
USING (public.is_rbac_admin(auth.uid()));

-- User-Profile assignments: lecture propres, gestion admins
CREATE POLICY "Users can view own profile assignments"
ON public.user_rbac_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_rbac_admin(auth.uid()));

CREATE POLICY "Admins can manage profile assignments"
ON public.user_rbac_profiles FOR ALL
TO authenticated
USING (public.is_rbac_admin(auth.uid()));

-- Audit log: lecture pour admins uniquement
CREATE POLICY "Admins can view audit log"
ON public.rbac_audit_log FOR SELECT
TO authenticated
USING (public.is_rbac_admin(auth.uid()));

CREATE POLICY "System can insert audit log"
ON public.rbac_audit_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- DONNÉES DE RÉFÉRENCE
-- ============================================

-- Portées
INSERT INTO public.rbac_scopes (code, label, description, display_order) VALUES
('self', 'Moi', 'Mes propres données uniquement', 1),
('direction', 'Ma direction', 'Données de ma direction', 2),
('global', 'Tout ANSUT', 'Toutes les données de l''organisation', 3),
('project_member', 'Projet membre', 'Projets où je suis membre', 4);

-- Actions
INSERT INTO public.rbac_actions (code, label, description, icon, display_order) VALUES
('view', 'Voir', 'Consulter les données', 'Eye', 1),
('create', 'Créer', 'Créer de nouvelles entrées', 'Plus', 2),
('update', 'Modifier', 'Modifier les données existantes', 'Pencil', 3),
('delete', 'Supprimer', 'Supprimer des entrées', 'Trash2', 4),
('export', 'Exporter', 'Exporter les données', 'Download', 5),
('validate', 'Valider', 'Valider/Approuver', 'CheckCircle', 6),
('assign', 'Affecter', 'Affecter à un utilisateur', 'UserPlus', 7),
('close', 'Clôturer', 'Clôturer/Archiver', 'Archive', 8);

-- Ressources/Modules
INSERT INTO public.rbac_resources (code, label, category, icon, description, display_order) VALUES
-- Gestion
('projects', 'Projets', 'Gestion', 'FolderKanban', 'Gestion des projets', 1),
('tasks', 'Tâches', 'Gestion', 'CheckSquare', 'Gestion des tâches', 2),
('diligences', 'Diligences', 'Gestion', 'FileCheck', 'Suivi des diligences', 3),
-- Finance
('budget', 'Budget', 'Finance', 'Wallet', 'Gestion budgétaire', 10),
('ptba', 'PTBA', 'Finance', 'Calendar', 'Plan de travail et budget annuel', 11),
-- Documents
('courrier', 'Courrier', 'Documents', 'Mail', 'Gestion du courrier', 20),
('documents', 'Documents', 'Documents', 'Files', 'Gestion documentaire', 21),
-- Collaboration
('reunions', 'Réunions', 'Collaboration', 'Users', 'Gestion des réunions', 30),
('events', 'Événements', 'Collaboration', 'CalendarDays', 'Gestion des événements', 31),
-- Administration
('rh', 'Ressources Humaines', 'Administration', 'UserCog', 'Gestion RH', 40),
('users', 'Utilisateurs', 'Système', 'Users', 'Gestion des utilisateurs', 50),
('profiles', 'Profils RBAC', 'Système', 'Shield', 'Gestion des profils et permissions', 51),
('settings', 'Paramètres', 'Système', 'Settings', 'Paramètres système', 52),
-- Métier IFN
('merchants', 'Marchands', 'Métier', 'Store', 'Gestion des marchands', 60),
('cooperatives', 'Coopératives', 'Métier', 'Building2', 'Gestion des coopératives', 61),
('agents', 'Agents', 'Métier', 'UserCheck', 'Gestion des agents terrain', 62),
('transactions', 'Transactions', 'Métier', 'Receipt', 'Gestion des transactions', 63),
('invoices', 'Factures', 'Métier', 'FileText', 'Gestion des factures', 64),
('stocks', 'Stocks', 'Métier', 'Package', 'Gestion des stocks', 65),
('reports', 'Rapports', 'Analytique', 'BarChart3', 'Rapports et analyses', 70);

-- Directions exemple
INSERT INTO public.directions (code, name, description) VALUES
('dg', 'Direction Générale', 'Direction générale de l''organisation'),
('dsi', 'Direction des Systèmes d''Information', 'DSI'),
('daf', 'Direction Administrative et Financière', 'DAF'),
('drh', 'Direction des Ressources Humaines', 'DRH'),
('djmg', 'Direction Juridique et Marchés Généraux', 'DJMG'),
('dcom', 'Direction de la Communication', 'Communication'),
('dop', 'Direction des Opérations', 'Opérations terrain');

-- Profils système par défaut
INSERT INTO public.rbac_profiles (name, description, default_scope_id, is_system) VALUES
('Super Admin', 'Accès total à toutes les fonctionnalités', (SELECT id FROM rbac_scopes WHERE code = 'global'), true),
('Direction Admin', 'Administrateur de direction avec accès complet à sa direction', (SELECT id FROM rbac_scopes WHERE code = 'direction'), true),
('Chef de Projet', 'Gestion complète des projets et tâches', (SELECT id FROM rbac_scopes WHERE code = 'project_member'), true),
('Gestionnaire Budget', 'Gestion financière et budgétaire', (SELECT id FROM rbac_scopes WHERE code = 'direction'), true),
('Auditeur', 'Consultation en lecture seule de toutes les données', (SELECT id FROM rbac_scopes WHERE code = 'global'), true),
('Utilisateur Standard', 'Accès basique aux fonctionnalités courantes', (SELECT id FROM rbac_scopes WHERE code = 'self'), true);

-- Permissions pour Super Admin (toutes les permissions)
INSERT INTO public.profile_permissions (profile_id, resource_id, action_id, scope_id, is_enabled)
SELECT 
    (SELECT id FROM rbac_profiles WHERE name = 'Super Admin'),
    r.id,
    a.id,
    (SELECT id FROM rbac_scopes WHERE code = 'global'),
    true
FROM rbac_resources r
CROSS JOIN rbac_actions a;

-- Permissions pour Auditeur (lecture seule sur tout)
INSERT INTO public.profile_permissions (profile_id, resource_id, action_id, scope_id, is_enabled)
SELECT 
    (SELECT id FROM rbac_profiles WHERE name = 'Auditeur'),
    r.id,
    (SELECT id FROM rbac_actions WHERE code = 'view'),
    (SELECT id FROM rbac_scopes WHERE code = 'global'),
    true
FROM rbac_resources r;

-- Permissions pour Chef de Projet
INSERT INTO public.profile_permissions (profile_id, resource_id, action_id, scope_id, is_enabled)
SELECT 
    (SELECT id FROM rbac_profiles WHERE name = 'Chef de Projet'),
    r.id,
    a.id,
    (SELECT id FROM rbac_scopes WHERE code = 'project_member'),
    true
FROM rbac_resources r
CROSS JOIN rbac_actions a
WHERE r.code IN ('projects', 'tasks', 'diligences', 'reunions', 'documents')
AND a.code IN ('view', 'create', 'update', 'assign');

-- Ajouter lecture budget pour Chef de Projet
INSERT INTO public.profile_permissions (profile_id, resource_id, action_id, scope_id, is_enabled)
SELECT 
    (SELECT id FROM rbac_profiles WHERE name = 'Chef de Projet'),
    (SELECT id FROM rbac_resources WHERE code = 'budget'),
    (SELECT id FROM rbac_actions WHERE code = 'view'),
    (SELECT id FROM rbac_scopes WHERE code = 'project_member'),
    true;

-- Permissions pour Gestionnaire Budget
INSERT INTO public.profile_permissions (profile_id, resource_id, action_id, scope_id, is_enabled)
SELECT 
    (SELECT id FROM rbac_profiles WHERE name = 'Gestionnaire Budget'),
    r.id,
    a.id,
    (SELECT id FROM rbac_scopes WHERE code = 'direction'),
    true
FROM rbac_resources r
CROSS JOIN rbac_actions a
WHERE r.code IN ('budget', 'ptba')
AND a.code IN ('view', 'create', 'update', 'export', 'validate');

-- Permissions pour Utilisateur Standard
INSERT INTO public.profile_permissions (profile_id, resource_id, action_id, scope_id, is_enabled)
SELECT 
    (SELECT id FROM rbac_profiles WHERE name = 'Utilisateur Standard'),
    r.id,
    a.id,
    (SELECT id FROM rbac_scopes WHERE code = 'self'),
    true
FROM rbac_resources r
CROSS JOIN rbac_actions a
WHERE r.code IN ('tasks', 'documents', 'reunions')
AND a.code IN ('view', 'create', 'update');

-- ============================================
-- INDEX POUR PERFORMANCE
-- ============================================

CREATE INDEX idx_user_rbac_profiles_user ON public.user_rbac_profiles(user_id);
CREATE INDEX idx_user_rbac_profiles_profile ON public.user_rbac_profiles(profile_id);
CREATE INDEX idx_profile_permissions_profile ON public.profile_permissions(profile_id);
CREATE INDEX idx_profile_permissions_resource ON public.profile_permissions(resource_id);
CREATE INDEX idx_rbac_audit_log_entity ON public.rbac_audit_log(entity_type, entity_id);
CREATE INDEX idx_rbac_audit_log_performed_by ON public.rbac_audit_log(performed_by);
CREATE INDEX idx_directions_parent ON public.directions(parent_id);