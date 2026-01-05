/**
 * Liste des commandes aux producteurs
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, CheckCircle } from 'lucide-react';
import { ProducerOrderCard } from './ProducerOrderCard';
import type { ProducerOrderWithDetails } from '../../types/producerOrder.types';

interface ProducerOrdersListProps {
  pendingOrders: ProducerOrderWithDetails[];
  completedOrders: ProducerOrderWithDetails[];
  onCancel?: (orderId: string) => void;
  isCancelling?: boolean;
}

export const ProducerOrdersList: React.FC<ProducerOrdersListProps> = ({ 
  pendingOrders, 
  completedOrders,
  onCancel,
  isCancelling 
}) => {
  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pending" className="gap-2">
          <ClipboardList className="h-4 w-4" />
          En cours ({pendingOrders.length})
        </TabsTrigger>
        <TabsTrigger value="completed" className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Terminées ({completedOrders.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4 space-y-3">
        {pendingOrders.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune commande en cours</p>
          </div>
        ) : (
          pendingOrders.map((order) => (
            <ProducerOrderCard 
              key={order.id} 
              order={order} 
              onCancel={onCancel}
              isCancelling={isCancelling}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="completed" className="mt-4 space-y-3">
        {completedOrders.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune commande terminée</p>
          </div>
        ) : (
          completedOrders.map((order) => (
            <ProducerOrderCard key={order.id} order={order} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};
