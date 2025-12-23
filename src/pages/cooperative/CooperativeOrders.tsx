import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { CooperativeBottomNav } from '@/components/cooperative/CooperativeBottomNav';
import { EmptyState, LoadingState } from '@/components/shared/StateComponents';
import { useCooperativeOrders } from '@/hooks/useCooperativeOrders';
import { OrderCard, CancelOrderDialog, Order } from '@/components/cooperative/orders';

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
      <header className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/cooperative')} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Commandes</h1>
            <p className="text-sm text-white/80">{orders.length} commande(s)</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="pending" className="relative">
              En attente
              {pendingOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center">
                  {pendingOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed">En cours</TabsTrigger>
            <TabsTrigger value="delivered">Livré</TabsTrigger>
            <TabsTrigger value="cancelled" className="relative">
              Annulé
              {cancelledOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">
                  {cancelledOrders.length}
                </span>
              )}
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

      <CooperativeBottomNav />
    </div>
  );
};

export default CooperativeOrders;
