import { useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pictogram } from "@/components/shared/Pictogram";
import type { StockItem } from "./types";
import { cn } from "@/lib/utils";

interface StockAlertsProps {
  outOfStockItems: StockItem[];
  lowStockItems: StockItem[];
  onRestock: (stock: StockItem) => void;
  onSpeakAlert?: (text: string) => void;
}

export function StockAlerts({ 
  outOfStockItems, 
  lowStockItems, 
  onRestock,
  onSpeakAlert 
}: StockAlertsProps) {
  
  // Auto-play alerte vocale au chargement si ruptures
  useEffect(() => {
    if (onSpeakAlert && outOfStockItems.length > 0) {
      const text = `Attention! ${outOfStockItems.length} produit${outOfStockItems.length > 1 ? 's' : ''} en rupture de stock.`;
      onSpeakAlert(text);
    } else if (onSpeakAlert && lowStockItems.length > 0) {
      const text = `${lowStockItems.length} produit${lowStockItems.length > 1 ? 's' : ''} avec stock bas.`;
      onSpeakAlert(text);
    }
  }, [outOfStockItems.length, lowStockItems.length, onSpeakAlert]);

  if (outOfStockItems.length === 0 && lowStockItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Alerte rupture - XXL et visible */}
      {outOfStockItems.length > 0 && (
        <Card className="border-2 border-destructive bg-destructive/10 overflow-hidden">
          <CardContent className="p-4">
            {/* Header alerte avec pictogramme pulsant */}
            <div className="flex items-center gap-3 mb-4">
              <div className="animate-pulse">
                <Pictogram type="alert" size="lg" />
              </div>
              <div>
                <h3 className="font-bold text-destructive text-lg">
                  {outOfStockItems.length} Rupture{outOfStockItems.length > 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-destructive/80">
                  Réapprovisionne vite !
                </p>
              </div>
            </div>
            
            {/* Liste produits en rupture */}
            <div className="space-y-2">
              {outOfStockItems.slice(0, 3).map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between bg-background/80 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <Pictogram type="stock" size="md" />
                    <span className="font-semibold text-foreground">
                      {item.product?.name}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => onRestock(item)}
                    className="h-12 px-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-bold">Ajouter</span>
                  </Button>
                </div>
              ))}
              {outOfStockItems.length > 3 && (
                <p className="text-sm text-destructive text-center pt-2">
                  +{outOfStockItems.length - 3} autres produits
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerte stock bas */}
      {lowStockItems.length > 0 && (
        <Card className="border-2 border-warning bg-warning/10 overflow-hidden">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <Pictogram type="low_stock" size="lg" />
              <div>
                <h3 className="font-bold text-warning-foreground text-lg">
                  {lowStockItems.length} Stock{lowStockItems.length > 1 ? 's' : ''} bas
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pense à réapprovisionner
                </p>
              </div>
            </div>
            
            {/* Liste produits stock bas */}
            <div className="space-y-2">
              {lowStockItems.slice(0, 2).map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between bg-background/80 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <Pictogram type="stock" size="md" />
                    <div>
                      <span className="font-semibold text-foreground block">
                        {item.product?.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.quantity} {item.product?.unit} restant
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => onRestock(item)}
                    className="h-12 px-4 border-2 border-warning text-warning-foreground gap-2"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              ))}
              {lowStockItems.length > 2 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{lowStockItems.length - 2} autres produits
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
