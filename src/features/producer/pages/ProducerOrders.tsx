/**
 * Page Commandes du Producteur - PNAVIM
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { 
  Sprout, 
  Package, 
  ShoppingCart, 
  User, 
  Loader2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  useProducerData, 
  useProducerOrders,
  OrderCard
} from '@/features/producer';

const ProducerOrders: React.FC = () => {
  const { producer, isLoading: isProducerLoading } = useProducerData();
  const { 
    pendingOrders,
    completedOrders,
    isLoading, 
    updateStatus,
    isUpdating
  } = useProducerOrders(producer?.id);

  const navItems = [
    { icon: Sprout, label: 'Accueil', path: '/producteur' },
    { icon: Package, label: 'Récoltes', path: '/producteur/recoltes' },
    { icon: ShoppingCart, label: 'Commandes', path: '/producteur/commandes', isActive: true },
    { icon: User, label: 'Profil', path: '/producteur/profil' },
  ];

  if (isProducerLoading) {
    return (
      <MobileLayout title="Commandes" navItems={navItems}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Commandes" navItems={navItems}>
      <div className="space-y-4 pb-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800">En cours</span>
            </div>
            <p className="text-2xl font-bold text-amber-900 mt-1">{pendingOrders.length}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-800">Terminées</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900 mt-1">{completedOrders.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="gap-1">
              En cours ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1">
              Terminées ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pendingOrders.length > 0 ? (
              pendingOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order}
                  onUpdateStatus={(orderId, status) => updateStatus({ orderId, status })}
                  isUpdating={isUpdating}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune commande en cours</p>
                <p className="text-sm mt-1">Les nouvelles commandes des coopératives apparaîtront ici</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedOrders.length > 0 ? (
              completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune commande terminée</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default ProducerOrders;
