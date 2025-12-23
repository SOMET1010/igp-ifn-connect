import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, XCircle, Clock, Calendar } from 'lucide-react';
import { CooperativeStockItem, getStockStatus, StockStatus } from './types';
import { format, parseISO, isPast, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StockCardProps {
  stock: CooperativeStockItem;
}

const statusConfig: Record<StockStatus, { label: string; className: string; icon: React.ReactNode }> = {
  out: { 
    label: 'Rupture', 
    className: 'bg-destructive text-destructive-foreground',
    icon: <XCircle className="w-3 h-3" />
  },
  low: { 
    label: 'Stock bas', 
    className: 'bg-warning text-warning-foreground',
    icon: <AlertTriangle className="w-3 h-3" />
  },
  expiring: { 
    label: 'Expire bientôt', 
    className: 'bg-amber-500 text-white',
    icon: <Clock className="w-3 h-3" />
  },
  ok: { 
    label: 'En stock', 
    className: 'bg-secondary text-secondary-foreground',
    icon: null
  }
};

const getExpiryDateStyle = (expiryDate: string): string => {
  const date = parseISO(expiryDate);
  if (isPast(date)) return 'text-destructive';
  if (differenceInDays(date, new Date()) <= 7) return 'text-amber-500';
  return 'text-muted-foreground';
};

export const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const status = getStockStatus(stock.quantity, stock.expiry_date);
  const config = statusConfig[status];

  return (
    <Card className={`card-institutional hover:border-primary/30 transition-colors ${status === 'out' ? 'border-destructive/50' : status === 'low' ? 'border-warning/50' : ''}`}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            status === 'out' ? 'bg-destructive/10' : 
            status === 'low' ? 'bg-warning/10' : 
            status === 'expiring' ? 'bg-amber-500/10' : 
            'bg-muted'
          }`}>
            <Package className={`w-5 h-5 ${
              status === 'out' ? 'text-destructive' : 
              status === 'low' ? 'text-warning' : 
              status === 'expiring' ? 'text-amber-500' : 
              'text-muted-foreground'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{stock.product.name}</h3>
            <p className="text-sm text-muted-foreground">
              {stock.quantity} {stock.product.unit}
              {stock.unit_price && ` • ${stock.unit_price.toLocaleString()} FCFA/${stock.product.unit}`}
            </p>
            {stock.expiry_date && (
              <p className={`text-xs flex items-center gap-1 mt-0.5 ${getExpiryDateStyle(stock.expiry_date)}`}>
                <Calendar className="w-3 h-3" />
                Expire le {format(parseISO(stock.expiry_date), 'd MMM yyyy', { locale: fr })}
              </p>
            )}
          </div>
        </div>
        <Badge className={`${config.className} flex items-center gap-1`}>
          {config.icon}
          {config.label}
        </Badge>
      </CardContent>
    </Card>
  );
};
