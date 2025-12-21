-- Enum pour les rôles utilisateur
CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'merchant', 'cooperative', 'user');

-- Enum pour le statut des marchands
CREATE TYPE public.merchant_status AS ENUM ('pending', 'validated', 'rejected', 'suspended');

-- Enum pour le type de transaction
CREATE TYPE public.transaction_type AS ENUM ('cash', 'mobile_money', 'transfer');

-- Enum pour le statut de commande
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled');

-- Table des rôles utilisateur (sécurisée)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Fonction pour vérifier les rôles (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Table des profils
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des marchés
CREATE TABLE public.markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    commune TEXT NOT NULL,
    region TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des agents
CREATE TABLE public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    employee_id TEXT NOT NULL UNIQUE,
    organization TEXT NOT NULL DEFAULT 'DGE',
    zone TEXT,
    is_active BOOLEAN DEFAULT true,
    total_enrollments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des marchands
CREATE TABLE public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    cmu_number TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    activity_description TEXT,
    market_id UUID REFERENCES public.markets(id),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    cmu_photo_url TEXT,
    location_photo_url TEXT,
    status merchant_status DEFAULT 'pending',
    enrolled_by UUID REFERENCES public.agents(id),
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    validated_at TIMESTAMP WITH TIME ZONE,
    cmu_valid_until DATE,
    rsti_balance DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des coopératives
CREATE TABLE public.cooperatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    region TEXT NOT NULL,
    commune TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    igp_certified BOOLEAN DEFAULT false,
    total_members INTEGER DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des catégories de produits
CREATE TABLE public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des produits
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.product_categories(id),
    name TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'kg',
    image_url TEXT,
    is_igp BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des stocks coopératives
CREATE TABLE public.stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cooperative_id UUID REFERENCES public.cooperatives(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2),
    lot_number TEXT,
    harvest_date DATE,
    expiry_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des transactions (POS)
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type transaction_type NOT NULL DEFAULT 'cash',
    reference TEXT,
    qr_code TEXT,
    cmu_deduction DECIMAL(10, 2) DEFAULT 0,
    rsti_deduction DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des commandes
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) NOT NULL,
    cooperative_id UUID REFERENCES public.cooperatives(id) NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    transport_cost DECIMAL(10, 2) DEFAULT 0,
    status order_status DEFAULT 'pending',
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des cotisations CMU
CREATE TABLE public.cmu_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table de synchronisation hors-ligne
CREATE TABLE public.offline_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    data JSONB NOT NULL,
    synced BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    synced_at TIMESTAMP WITH TIME ZONE
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmu_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Politiques RLS pour profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour markets (lecture publique)
CREATE POLICY "Anyone can view markets" ON public.markets
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage markets" ON public.markets
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Politiques RLS pour agents
CREATE POLICY "Agents can view own data" ON public.agents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage agents" ON public.agents
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Politiques RLS pour merchants
CREATE POLICY "Merchants can view own data" ON public.merchants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Agents can view enrolled merchants" ON public.merchants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agents a 
            WHERE a.user_id = auth.uid() 
            AND a.id = public.merchants.enrolled_by
        )
    );

CREATE POLICY "Agents can insert merchants" ON public.merchants
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Admins can manage merchants" ON public.merchants
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Politiques RLS pour cooperatives
CREATE POLICY "Cooperatives can view own data" ON public.cooperatives
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view cooperatives" ON public.cooperatives
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage cooperatives" ON public.cooperatives
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Politiques RLS pour products (lecture publique)
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Politiques RLS pour product_categories (lecture publique)
CREATE POLICY "Anyone can view categories" ON public.product_categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.product_categories
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Politiques RLS pour stocks
CREATE POLICY "Cooperatives can manage own stocks" ON public.stocks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.cooperatives c 
            WHERE c.id = public.stocks.cooperative_id 
            AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view stocks" ON public.stocks
    FOR SELECT USING (true);

-- Politiques RLS pour transactions
CREATE POLICY "Merchants can manage own transactions" ON public.transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.merchants m 
            WHERE m.id = public.transactions.merchant_id 
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all transactions" ON public.transactions
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Politiques RLS pour orders
CREATE POLICY "Merchants can manage own orders" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.merchants m 
            WHERE m.id = public.orders.merchant_id 
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Cooperatives can view orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.cooperatives c 
            WHERE c.id = public.orders.cooperative_id 
            AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Cooperatives can update orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.cooperatives c 
            WHERE c.id = public.orders.cooperative_id 
            AND c.user_id = auth.uid()
        )
    );

-- Politiques RLS pour cmu_payments
CREATE POLICY "Merchants can view own payments" ON public.cmu_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.merchants m 
            WHERE m.id = public.cmu_payments.merchant_id 
            AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage payments" ON public.cmu_payments
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Politiques RLS pour offline_sync
CREATE POLICY "Users can manage own sync data" ON public.offline_sync
    FOR ALL USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_merchants_updated_at
    BEFORE UPDATE ON public.merchants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cooperatives_updated_at
    BEFORE UPDATE ON public.cooperatives
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stocks_updated_at
    BEFORE UPDATE ON public.stocks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour créer le profil automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'full_name', 'Utilisateur'));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user');
    
    RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();