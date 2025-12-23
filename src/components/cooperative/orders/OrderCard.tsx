import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Truck, X } from 'lucide-react';
import { Order, statusLabels } from './types';

interface OrderCardProps {
  order: Order;
  updatingOrderId: string | null;
  onUpdateStatus: (orderId: string, status: 'confirmed' | 'in_transit' | 'delivered') => void;
  onCancelClick: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  updatingOrderId,
  onUpdateStatus,
  onCancelClick,
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{order.product_name}</h3>
          <p className="text-sm text-muted-foreground">{order.merchant_name}</p>
        </div>
        <Badge className={statusLabels[order.status].color}>
          {statusLabels[order.status].label}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-muted-foreground">
          {order.quantity} {order.product_unit} × {order.unit_price.toLocaleString()} FCFA
        </span>
        <span className="font-semibold text-foreground">
          {order.total_amount.toLocaleString()} FCFA
        </span>
      </div>

      {order.status === 'cancelled' && order.cancellation_reason && (
        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-2 mb-3">
          <p className="text-xs text-red-600 dark:text-red-400">
            <span className="font-medium">Motif:</span> {order.cancellation_reason}
          </p>
        </div>
      )}

      {order.status === 'pending' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onUpdateStatus(order.id, 'confirmed')}
            disabled={updatingOrderId === order.id}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {updatingOrderId === order.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Confirmer
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancelClick(order)}
            disabled={updatingOrderId === order.id}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {order.status === 'confirmed' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onUpdateStatus(order.id, 'delivered')}
            disabled={updatingOrderId === order.id}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {updatingOrderId === order.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Truck className="h-4 w-4 mr-1" />
                Marquer livré
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancelClick(order)}
            disabled={updatingOrderId === order.id}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        {new Date(order.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </CardContent>
  </Card>
);
