import { AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { StockItem } from "./types";

interface StockAlertsProps {
  outOfStockItems: StockItem[];
  lowStockItems: StockItem[];
  onRestock: (stock: StockItem) => void;
}

export function StockAlerts({ outOfStockItems, lowStockItems, onRestock }: StockAlertsProps) {
  if (outOfStockItems.length === 0 && lowStockItems.length === 0) {
    return null;
  }

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h3 className="font-semibold text-foreground">Alertes de stock</h3>
        </div>
        <div className="space-y-2">
          {outOfStockItems.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-destructive/10 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive" />
                <span className="font-medium text-sm">{item.product?.name}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onRestock(item)}
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Réappro.
              </Button>
            </div>
          ))}
          {lowStockItems.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-warning/10 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning" />
                <span className="font-medium text-sm">{item.product?.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({item.quantity} {item.product?.unit})
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onRestock(item)}
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Réappro.
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
