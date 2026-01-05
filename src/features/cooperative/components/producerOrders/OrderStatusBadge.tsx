/**
 * Badge de statut de commande producteur
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  PRODUCER_ORDER_STATUS_LABELS, 
  PRODUCER_ORDER_STATUS_COLORS,
  type ProducerOrderStatus 
} from '../../types/producerOrder.types';

interface OrderStatusBadgeProps {
  status: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const statusKey = status as ProducerOrderStatus;
  const label = PRODUCER_ORDER_STATUS_LABELS[statusKey] || status;
  const colorClass = PRODUCER_ORDER_STATUS_COLORS[statusKey] || 'bg-gray-100 text-gray-800';

  return (
    <Badge className={`${colorClass} border-0`}>
      {label}
    </Badge>
  );
};
