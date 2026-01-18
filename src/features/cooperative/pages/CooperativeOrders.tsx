/**
 * CooperativeOrders - Commandes Coopérative
 * Refonte Jùlaba Design System
 */

import React, { useState } from 'react';
import { useAuth } from '@/shared/contexts';
import { Loader2 } from 'lucide-react';
import {
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaTabBar,
  JulabaBottomNav,
  JulabaEmptyState,
  type JulabaNavItem,
} from '@/shared/ui/julaba';
import { useCooperativeOrders } from '@/features/cooperative';
import type { Order } from '@/features/cooperative';
import { OrderCard, CancelOrderDialog } from '@/features/cooperative/components/orders';

// Nav items Coopérative
const COOP_NAV_ITEMS: JulabaNavItem[] = [
  { emoji: '🏠', label: 'Accueil', path: '/cooperative' },
  { emoji: '📦', label: 'Stock', path: '/cooperative/stock' },
  { emoji: '📋', label: 'Commandes', path: '/cooperative/commandes' },
  { emoji: '👤', label: 'Profil', path: '/cooperative/profil' },
];

const ORDER_TABS = [
  { id: 'pending', label: 'En attente', emoji: '⏳' },
  { id: 'confirmed', label: 'Confirmé', emoji: '✅' },
  { id: 'in_transit', label: 'En transit', emoji: '🚚' },
  { id: 'delivered', label: 'Livré', emoji: '📦' },
  { id: 'cancelled', label: 'Annulé', emoji: '❌' },
];

const CooperativeOrders: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  
  const {
    orders,
    isLoading,
    updatingOrderId,
    updateOrderStatus,
    cancelOrder,
    pendingOrders,
    confirmedOrders,
    inTransitOrders,
    deliveredOrders,
    cancelledOrders,
  } = useCooperativeOrders(user?.id);

  const openCancelDialog = (order: Order) => {
    setOrderToCancel(order);
    setShowCancelDialog(true);
  };

  const getOrdersByTab = () => {
    switch (activeTab) {
      case 'pending': return pendingOrders;
      case 'confirmed': return confirmedOrders;
      case 'in_transit': return inTransitOrders;
      case 'delivered': return deliveredOrders;
      case 'cancelled': return cancelledOrders;
      default: return [];
    }
  };

  const currentOrders = getOrdersByTab();

  if (isLoading) {
    return (
      <JulabaPageLayout background="gradient">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="gradient">
      <JulabaHeader
        title="Commandes"
        subtitle={`${orders.length} commande(s)`}
        showBack
        backPath="/cooperative"
      />

      <div className="p-4 space-y-4">
        {/* Tabs */}
        <JulabaTabBar
          tabs={ORDER_TABS.map(t => {
            let count = 0;
            switch (t.id) {
              case 'pending': count = pendingOrders.length; break;
              case 'confirmed': count = confirmedOrders.length; break;
              case 'in_transit': count = inTransitOrders.length; break;
              case 'delivered': count = deliveredOrders.length; break;
              case 'cancelled': count = cancelledOrders.length; break;
            }
            return { ...t, label: `${t.emoji} ${count}` };
          })}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Liste */}
        {currentOrders.length === 0 ? (
          <JulabaEmptyState
            emoji={ORDER_TABS.find(t => t.id === activeTab)?.emoji || '📋'}
            title={`Aucune commande ${ORDER_TABS.find(t => t.id === activeTab)?.label.toLowerCase() || ''}`}
            description="Les commandes correspondantes apparaîtront ici"
          />
        ) : (
          <div className="space-y-3">
            {currentOrders.map(order => (
              <JulabaCard key={order.id} className="p-3">
                <OrderCard
                  order={order}
                  updatingOrderId={updatingOrderId}
                  onUpdateStatus={updateOrderStatus}
                  onCancelClick={openCancelDialog}
                />
              </JulabaCard>
            ))}
          </div>
        )}
      </div>

      <CancelOrderDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        order={orderToCancel}
        onConfirm={cancelOrder}
      />

      <JulabaBottomNav items={COOP_NAV_ITEMS} />
    </JulabaPageLayout>
  );
};

export default CooperativeOrders;
