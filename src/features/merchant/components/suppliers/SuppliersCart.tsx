// ============================================
// Component - Suppliers Floating Cart
// ============================================

import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle } from "lucide-react";
import type { CartItem } from "../../types/suppliers.types";

interface SuppliersCartProps {
  cart: CartItem[];
  cartTotal: number;
  onUpdateQuantity: (stockId: string, delta: number) => void;
  onRemoveItem: (stockId: string) => void;
  onValidate: () => void;
}

export function SuppliersCart({
  cart,
  cartTotal,
  onUpdateQuantity,
  onRemoveItem,
  onValidate,
}: SuppliersCartProps) {
  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-card border-2 border-primary rounded-2xl shadow-2xl p-4 z-40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Mon panier</p>
            <p className="text-xs text-muted-foreground">
              {cart.length} article{cart.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <p className="text-xl font-bold text-primary">
          {cartTotal.toLocaleString()} F
        </p>
      </div>

      {/* Cart Items (collapsed view) */}
      <div className="max-h-32 overflow-y-auto space-y-2 mb-3">
        {cart.map((item) => (
          <div
            key={item.stockId}
            className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.productName}</p>
              <p className="text-xs text-muted-foreground">
                {item.cooperativeName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onUpdateQuantity(item.stockId, -1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onUpdateQuantity(item.stockId, 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => onRemoveItem(item.stockId)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Validate Button */}
      <Button
        className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 rounded-xl"
        onClick={onValidate}
      >
        <CheckCircle className="h-5 w-5 mr-2" />
        Valider la commande
      </Button>
    </div>
  );
}
