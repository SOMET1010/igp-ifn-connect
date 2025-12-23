import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { CooperativeStockItem } from './types';

interface StockCardProps {
  stock: CooperativeStockItem;
}

export const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  return (
    <Card className="card-institutional hover:border-primary/30 transition-colors">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{stock.product.name}</h3>
            <p className="text-sm text-muted-foreground">
              {stock.quantity} {stock.product.unit}
              {stock.unit_price && ` • ${stock.unit_price.toLocaleString()} FCFA/${stock.product.unit}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
