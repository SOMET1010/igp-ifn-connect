import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { CooperativeStockItem } from './types';

interface LowStockAlertProps {
  items: CooperativeStockItem[];
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <Card className="border-warning/50 bg-warning/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h3 className="font-semibold text-foreground">Alertes de stock ({items.length})</h3>
        </div>
        <div className="space-y-2">
          {items.slice(0, 3).map(item => (
            <div key={item.id} className="flex items-center justify-between bg-warning/10 rounded-lg p-2">
              <span className="font-medium text-sm">{item.product.name}</span>
              <span className="text-sm text-muted-foreground">{item.quantity} {item.product.unit}</span>
            </div>
          ))}
          {items.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{items.length - 3} autre(s) produit(s) en stock bas
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
