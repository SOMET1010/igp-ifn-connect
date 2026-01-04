/**
 * Carte affichant une commande reçue par le producteur
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Building2, Package, Calendar, Phone, CheckCircle, XCircle, Truck, Clock } from 'lucide-react';
import type { CooperativeProducerOrder, CooperativeOrderStatus } from '../types/producer.types';

interface OrderCardProps {
  order: CooperativeProducerOrder;
  onUpdateStatus?: (orderId: string, status: CooperativeOrderStatus) => void;
  isUpdating?: boolean;
}

const STATUS_CONFIG: Record<CooperativeOrderStatus, { 
  label: string; 
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: React.ReactNode;
}> = {
  pending: { label: 'En attente', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  confirmed: { label: 'Confirmée', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
  preparing: { label: 'En préparation', variant: 'default', icon: <Package className="h-3 w-3" /> },
  ready: { label: 'Prête', variant: 'default', icon: <Package className="h-3 w-3" /> },
  delivered: { label: 'Livrée', variant: 'outline', icon: <Truck className="h-3 w-3" /> },
  cancelled: { label: 'Annulée', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
};

const NEXT_STATUS: Partial<Record<CooperativeOrderStatus, CooperativeOrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

const NEXT_STATUS_LABEL: Partial<Record<CooperativeOrderStatus, string>> = {
  pending: 'Confirmer',
  confirmed: 'Préparer',
  preparing: 'Marquer prêt',
  ready: 'Marquer livrée',
};

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  onUpdateStatus,
  isUpdating 
}) => {
  const statusConfig = STATUS_CONFIG[order.status];
  const nextStatus = NEXT_STATUS[order.status];
  const canProgress = nextStatus && onUpdateStatus;
  const canCancel = order.status === 'pending' && onUpdateStatus;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-semibold">{order.cooperative?.name}</h3>
              <p className="text-xs text-muted-foreground">{order.cooperative?.code}</p>
            </div>
          </div>
          <Badge variant={statusConfig.variant} className="flex items-center gap-1">
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{order.product?.name}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Quantité</p>
              <p className="font-semibold">{order.quantity} {order.product?.unit}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Prix unit.</p>
              <p className="font-semibold">{formatCurrency(order.unit_price)} F</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-semibold text-primary">{formatCurrency(order.total_amount)} F</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}</span>
          </div>
          {order.cooperative?.phone && (
            <a 
              href={`tel:${order.cooperative.phone}`}
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              <span>Appeler</span>
            </a>
          )}
        </div>

        {order.delivery_date && (
          <p className="text-sm text-muted-foreground mb-3">
            📅 Livraison prévue : {format(new Date(order.delivery_date), 'dd MMM yyyy', { locale: fr })}
          </p>
        )}

        {order.notes && (
          <p className="text-sm text-muted-foreground mb-3 bg-muted/30 p-2 rounded">
            💬 {order.notes}
          </p>
        )}

        {(canProgress || canCancel) && (
          <div className="flex gap-2 pt-3 border-t">
            {canProgress && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onUpdateStatus(order.id, nextStatus!)}
                disabled={isUpdating}
              >
                {NEXT_STATUS_LABEL[order.status]}
              </Button>
            )}
            {canCancel && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onUpdateStatus(order.id, 'cancelled')}
                disabled={isUpdating}
              >
                Refuser
              </Button>
            )}
          </div>
        )}

        {order.status === 'cancelled' && order.cancellation_reason && (
          <p className="text-sm text-destructive mt-2">
            Raison : {order.cancellation_reason}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
