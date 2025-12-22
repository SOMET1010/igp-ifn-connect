import { Package, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StockItem, StockStatus } from "./types";
import { getStockStatus } from "./types";

interface StockCardProps {
  stock: StockItem;
  onRestock: (stock: StockItem) => void;
  onEdit: (stock: StockItem) => void;
  onDelete: (stockId: string) => void;
}

function getStatusBadge(status: StockStatus) {
  switch (status) {
    case "out":
      return <Badge variant="destructive" className="text-xs">Rupture</Badge>;
    case "low":
      return <Badge className="bg-warning text-warning-foreground text-xs">Stock bas</Badge>;
    case "ok":
      return <Badge className="bg-secondary text-secondary-foreground text-xs">En stock</Badge>;
  }
}

export function StockCard({ stock, onRestock, onEdit, onDelete }: StockCardProps) {
  const status = getStockStatus(Number(stock.quantity), Number(stock.min_threshold));

  return (
    <Card className="card-institutional hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{stock.product?.name}</h4>
                {stock.product?.is_igp && (
                  <Badge variant="outline" className="text-xs">IGP</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-foreground">
                  {stock.quantity} {stock.product?.unit}
                </span>
                {getStatusBadge(status)}
              </div>
              {stock.unit_price && (
                <p className="text-xs text-muted-foreground mt-1">
                  Prix: {Number(stock.unit_price).toLocaleString()} FCFA/{stock.product?.unit}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRestock(stock)}
              className="h-8 w-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(stock)}
              className="h-8 w-8"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(stock.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
