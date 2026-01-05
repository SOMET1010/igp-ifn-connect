/**
 * Carte de commande producteur
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Package, Calendar, Phone, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { ProducerOrderWithDetails } from '../../types/producerOrder.types';

interface ProducerOrderCardProps {
  order: ProducerOrderWithDetails;
  onCancel?: (orderId: string) => void;
  isCancelling?: boolean;
}

export const ProducerOrderCard: React.FC<ProducerOrderCardProps> = ({ 
  order, 
  onCancel,
  isCancelling 
}) => {
  const canCancel = ['pending'].includes(order.status);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <span className="text-xs text-muted-foreground">
              {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>
          <p className="font-bold text-lg">
            {order.total_amount.toLocaleString()} FCFA
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{order.producer?.full_name}</span>
            {order.producer?.phone && (
              <span className="text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {order.producer.phone}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>
              {order.product?.name} - {order.quantity} {order.product?.unit}
            </span>
            <span className="text-muted-foreground">
              @ {order.unit_price.toLocaleString()} FCFA/{order.product?.unit}
            </span>
          </div>

          {order.delivery_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Livraison: {format(new Date(order.delivery_date), 'dd MMM yyyy', { locale: fr })}
            </div>
          )}

          {order.notes && (
            <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
              {order.notes}
            </p>
          )}

          {order.status === 'cancelled' && order.cancellation_reason && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
              Annulée: {order.cancellation_reason}
            </p>
          )}
        </div>

        {canCancel && onCancel && (
          <div className="mt-3 pt-3 border-t flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onCancel(order.id)}
              disabled={isCancelling}
            >
              <X className="h-4 w-4 mr-1" />
              Annuler
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
