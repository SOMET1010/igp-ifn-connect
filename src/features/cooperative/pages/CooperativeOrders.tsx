import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/shared/contexts';
import { ClipboardList } from 'lucide-react';
import { EnhancedHeader, UnifiedBottomNav, EmptyState, LoadingState, NotificationBadge } from '@/shared/ui';
import { cooperativeNavItems } from '@/config/navigation';
import { useCooperativeOrders } from '@/features/cooperative';
import type { Order } from '@/features/cooperative';
import { OrderCard, CancelOrderDialog } from '@/features/cooperative/components/orders';

const CooperativeOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Chargement des commandes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <EnhancedHeader
        title="Commandes"
        subtitle={`${orders.length} commande(s)`}
        showBack
        backTo="/cooperative"
      />

      <div className="p-4">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="pending" className="relative text-xs">
              En attente
              <NotificationBadge 
                count={pendingOrders.length} 
                variant="warning" 
                size="sm" 
                absolute 
              />
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="text-xs">Confirmé</TabsTrigger>
            <TabsTrigger value="in_transit" className="text-xs">En transit</TabsTrigger>
            <TabsTrigger value="delivered" className="text-xs">Livré</TabsTrigger>
            <TabsTrigger value="cancelled" className="relative text-xs">
              Annulé
              <NotificationBadge 
                count={cancelledOrders.length} 
                variant="destructive" 
                size="sm" 
                absolute 
              />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {pendingOrders.length === 0 ? (
              <EmptyState Icon={ClipboardList} title="Aucune commande en attente" variant="card" />
            ) : (
              pendingOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  updatingOrderId={updatingOrderId}
                  onUpdateStatus={updateOrderStatus}
                  onCancelClick={openCancelDialog}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-3">
            {confirmedOrders.length === 0 ? (
              <EmptyState Icon={ClipboardList} title="Aucune commande confirmée" variant="card" />
            ) : (
              confirmedOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  updatingOrderId={updatingOrderId}
                  onUpdateStatus={updateOrderStatus}
                  onCancelClick={openCancelDialog}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="in_transit" className="space-y-3">
            {inTransitOrders.length === 0 ? (
              <EmptyState Icon={ClipboardList} title="Aucune commande en transit" variant="card" />
            ) : (
              inTransitOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  updatingOrderId={updatingOrderId}
                  onUpdateStatus={updateOrderStatus}
                  onCancelClick={openCancelDialog}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="delivered" className="space-y-3">
            {deliveredOrders.length === 0 ? (
              <EmptyState Icon={ClipboardList} title="Aucune commande livrée" variant="card" />
            ) : (
              deliveredOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  updatingOrderId={updatingOrderId}
                  onUpdateStatus={updateOrderStatus}
                  onCancelClick={openCancelDialog}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-3">
            {cancelledOrders.length === 0 ? (
              <EmptyState Icon={ClipboardList} title="Aucune commande annulée" variant="card" />
            ) : (
              cancelledOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  updatingOrderId={updatingOrderId}
                  onUpdateStatus={updateOrderStatus}
                  onCancelClick={openCancelDialog}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CancelOrderDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        order={orderToCancel}
        onConfirm={cancelOrder}
      />

      <UnifiedBottomNav items={cooperativeNavItems} />
    </div>
  );
};

export default CooperativeOrders;
