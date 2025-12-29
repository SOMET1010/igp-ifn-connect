-- =============================================
-- Table: notifications
-- Système de notifications en temps réel
-- =============================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  category TEXT NOT NULL CHECK (category IN ('stock', 'order', 'credit', 'payment', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Index pour performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- =============================================
-- Function: create_notification
-- Helper pour créer des notifications
-- =============================================
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_category TEXT,
  p_title TEXT,
  p_message TEXT,
  p_icon TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, category, title, message, icon, action_url, metadata)
  VALUES (p_user_id, p_type, p_category, p_title, p_message, p_icon, p_action_url, p_metadata)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- =============================================
-- Trigger: Stock bas (merchant_stocks)
-- Notifie quand le stock descend sous le seuil
-- =============================================
CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_merchant_user_id UUID;
  v_product_name TEXT;
BEGIN
  -- Récupérer le user_id du marchand
  SELECT m.user_id INTO v_merchant_user_id
  FROM merchants m
  WHERE m.id = NEW.merchant_id;
  
  -- Récupérer le nom du produit
  SELECT p.name INTO v_product_name
  FROM products p
  WHERE p.id = NEW.product_id;
  
  IF v_merchant_user_id IS NOT NULL AND v_product_name IS NOT NULL THEN
    -- Stock épuisé
    IF NEW.quantity = 0 AND (OLD.quantity IS NULL OR OLD.quantity > 0) THEN
      PERFORM create_notification(
        v_merchant_user_id,
        'error',
        'stock',
        'Rupture de stock',
        'Le produit "' || v_product_name || '" est épuisé.',
        '🚨',
        '/marchand/stock',
        jsonb_build_object('product_id', NEW.product_id, 'stock_id', NEW.id)
      );
    -- Stock faible (sous le seuil)
    ELSIF NEW.quantity <= COALESCE(NEW.min_threshold, 5) AND NEW.quantity > 0 
          AND (OLD.quantity IS NULL OR OLD.quantity > COALESCE(NEW.min_threshold, 5)) THEN
      PERFORM create_notification(
        v_merchant_user_id,
        'warning',
        'stock',
        'Stock faible',
        'Le produit "' || v_product_name || '" est presque épuisé (' || NEW.quantity || ' restants).',
        '⚠️',
        '/marchand/stock',
        jsonb_build_object('product_id', NEW.product_id, 'stock_id', NEW.id, 'quantity', NEW.quantity)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_low_stock
  AFTER INSERT OR UPDATE OF quantity ON public.merchant_stocks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_low_stock();

-- =============================================
-- Trigger: Crédit en retard (customer_credits)
-- Notifie quand un crédit dépasse sa date d'échéance
-- =============================================
CREATE OR REPLACE FUNCTION public.notify_overdue_credit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_merchant_user_id UUID;
BEGIN
  -- Vérifier si le crédit vient de devenir en retard
  IF NEW.due_date IS NOT NULL 
     AND NEW.due_date < CURRENT_DATE 
     AND NEW.status = 'pending'
     AND (OLD.due_date IS NULL OR OLD.due_date >= CURRENT_DATE) THEN
    
    -- Récupérer le user_id du marchand
    SELECT m.user_id INTO v_merchant_user_id
    FROM merchants m
    WHERE m.id = NEW.merchant_id;
    
    IF v_merchant_user_id IS NOT NULL THEN
      PERFORM create_notification(
        v_merchant_user_id,
        'warning',
        'credit',
        'Crédit en retard',
        'Le crédit de "' || NEW.customer_name || '" (' || NEW.amount_owed || ' FCFA) est en retard.',
        '💳',
        '/marchand/credits',
        jsonb_build_object('credit_id', NEW.id, 'customer_name', NEW.customer_name, 'amount', NEW.amount_owed)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_overdue_credit
  AFTER UPDATE OF due_date, status ON public.customer_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_overdue_credit();

-- =============================================
-- Trigger: Nouvelle commande (orders)
-- Notifie la coopérative d'une nouvelle commande
-- =============================================
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coop_user_id UUID;
  v_merchant_name TEXT;
  v_product_name TEXT;
BEGIN
  -- Récupérer le user_id de la coopérative
  SELECT c.user_id INTO v_coop_user_id
  FROM cooperatives c
  WHERE c.id = NEW.cooperative_id;
  
  -- Récupérer le nom du marchand
  SELECT m.full_name INTO v_merchant_name
  FROM merchants m
  WHERE m.id = NEW.merchant_id;
  
  -- Récupérer le nom du produit
  SELECT p.name INTO v_product_name
  FROM products p
  WHERE p.id = NEW.product_id;
  
  IF v_coop_user_id IS NOT NULL THEN
    PERFORM create_notification(
      v_coop_user_id,
      'info',
      'order',
      'Nouvelle commande',
      'Commande de ' || NEW.quantity || ' ' || COALESCE(v_product_name, 'produits') || ' par ' || COALESCE(v_merchant_name, 'un marchand') || '.',
      '📦',
      '/cooperative/orders',
      jsonb_build_object('order_id', NEW.id, 'merchant_name', v_merchant_name, 'quantity', NEW.quantity)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_order();

-- =============================================
-- Trigger: Changement de statut commande (orders)
-- Notifie le marchand des mises à jour de commande
-- =============================================
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_merchant_user_id UUID;
  v_product_name TEXT;
  v_notification_type TEXT;
  v_notification_title TEXT;
  v_notification_message TEXT;
  v_notification_icon TEXT;
BEGIN
  -- Ne notifier que si le statut a changé
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Récupérer le user_id du marchand
  SELECT m.user_id INTO v_merchant_user_id
  FROM merchants m
  WHERE m.id = NEW.merchant_id;
  
  -- Récupérer le nom du produit
  SELECT p.name INTO v_product_name
  FROM products p
  WHERE p.id = NEW.product_id;
  
  IF v_merchant_user_id IS NOT NULL THEN
    -- Définir le contenu selon le statut
    CASE NEW.status
      WHEN 'confirmed' THEN
        v_notification_type := 'success';
        v_notification_title := 'Commande confirmée';
        v_notification_message := 'Votre commande de ' || COALESCE(v_product_name, 'produits') || ' a été confirmée.';
        v_notification_icon := '✅';
      WHEN 'in_transit' THEN
        v_notification_type := 'info';
        v_notification_title := 'Commande en livraison';
        v_notification_message := 'Votre commande de ' || COALESCE(v_product_name, 'produits') || ' est en cours de livraison.';
        v_notification_icon := '🚚';
      WHEN 'delivered' THEN
        v_notification_type := 'success';
        v_notification_title := 'Commande livrée';
        v_notification_message := 'Votre commande de ' || COALESCE(v_product_name, 'produits') || ' a été livrée.';
        v_notification_icon := '📬';
      WHEN 'cancelled' THEN
        v_notification_type := 'error';
        v_notification_title := 'Commande annulée';
        v_notification_message := 'Votre commande de ' || COALESCE(v_product_name, 'produits') || ' a été annulée.';
        v_notification_icon := '❌';
      ELSE
        RETURN NEW;
    END CASE;
    
    PERFORM create_notification(
      v_merchant_user_id,
      v_notification_type,
      'order',
      v_notification_title,
      v_notification_message,
      v_notification_icon,
      '/marchand/fournisseurs',
      jsonb_build_object('order_id', NEW.id, 'status', NEW.status, 'product_name', v_product_name)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_order_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();