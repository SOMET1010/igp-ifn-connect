import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pictogram } from "@/components/shared/Pictogram";
import type { StockItem, StockStatus } from "./types";
import { getStockStatus } from "./types";
import { cn } from "@/lib/utils";

interface StockCardProps {
  stock: StockItem;
  onRestock: (stock: StockItem) => void;
  onEdit: (stock: StockItem) => void;
  onDelete: (stockId: string) => void;
  onSpeak?: (text: string) => void;
}

function getStatusConfig(status: StockStatus) {
  switch (status) {
    case "out":
      return {
        label: "Rupture",
        bgColor: "bg-destructive/10",
        textColor: "text-destructive",
        borderColor: "border-destructive/30",
        pictogram: "alert" as const,
      };
    case "low":
      return {
        label: "Stock bas",
        bgColor: "bg-warning/10",
        textColor: "text-warning-foreground",
        borderColor: "border-warning/30",
        pictogram: "low_stock" as const,
      };
    case "ok":
      return {
        label: "En stock",
        bgColor: "bg-secondary/10",
        textColor: "text-secondary",
        borderColor: "border-secondary/30",
        pictogram: "in_stock" as const,
      };
  }
}

export function StockCard({ stock, onRestock, onEdit, onDelete, onSpeak }: StockCardProps) {
  const status = getStockStatus(Number(stock.quantity), Number(stock.min_threshold));
  const config = getStatusConfig(status);

  const handleTap = () => {
    if (onSpeak) {
      const text = `${stock.product?.name}. ${stock.quantity} ${stock.product?.unit} en stock.`;
      onSpeak(text);
    }
  };

  return (
    <Card 
      className={cn(
        "card-institutional hover:border-primary/30 transition-all stock-card-inclusive",
        status === "out" && "border-destructive/50 bg-destructive/5"
      )}
      onClick={handleTap}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Pictogramme produit XXL */}
          <Pictogram type="stock" size="xl" showBackground />
          
          {/* Infos produit */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-foreground text-lg truncate">
                {stock.product?.name}
              </h4>
              {stock.product?.is_igp && (
                <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-medium">
                  IGP
                </span>
              )}
            </div>
            
            {/* Quantité XXL */}
            <div className="flex items-center gap-3">
              <span className="stock-qty-big text-foreground">
                {stock.quantity}
              </span>
              <span className="text-lg text-muted-foreground font-medium">
                {stock.product?.unit}
              </span>
            </div>

            {/* Badge statut visuel */}
            <div className={cn(
              "inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full",
              config.bgColor
            )}>
              <Pictogram type={config.pictogram} size="sm" showBackground={false} />
              <span className={cn("text-sm font-semibold", config.textColor)}>
                {config.label}
              </span>
            </div>
          </div>
        </div>

        {/* Prix unitaire */}
        {stock.unit_price && (
          <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
            <Pictogram type="money" size="sm" showBackground={false} />
            <span>{Number(stock.unit_price).toLocaleString()} FCFA/{stock.product?.unit}</span>
          </p>
        )}

        {/* Actions XXL */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-border">
          <Button
            onClick={(e) => { e.stopPropagation(); onRestock(stock); }}
            className="stock-action-btn flex-1 h-14 bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2"
          >
            <Plus className="w-6 h-6" />
            <span className="font-bold">Ajouter</span>
          </Button>
          <Button
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onEdit(stock); }}
            className="stock-action-btn h-14 w-14 border-2 border-primary text-primary hover:bg-primary/10"
          >
            <Edit2 className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onDelete(stock.id); }}
            className="stock-action-btn h-14 w-14 border-2 border-destructive text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-6 h-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
