// ============================================
// Component - OrderSuccessScreen
// Displays success animation after order submission
// ============================================

import { useEffect } from "react";
import { CheckCircle, Package, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/shared/ui";
import type { CartItem } from "../../types/suppliers.types";

interface OrderSuccessScreenProps {
  orderItems: CartItem[];
  deliveryDate?: string;
  onViewOrders: () => void;
}

export function OrderSuccessScreen({
  orderItems,
  deliveryDate,
  onViewOrders,
}: OrderSuccessScreenProps) {
  // Group by cooperative
  const cooperatives = [...new Set(orderItems.map((item) => item.cooperativeName))];
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onViewOrders();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onViewOrders]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <Confetti />
      
      <div className="mx-4 w-full max-w-md rounded-2xl bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
          Commande envoyée !
        </h2>
        <p className="mb-6 text-center text-muted-foreground">
          Votre commande a été transmise aux coopératives
        </p>

        {/* Order Summary */}
        <div className="mb-6 space-y-4 rounded-lg bg-muted/50 p-4">
          {/* Items */}
          <div className="flex items-start gap-3">
            <Package className="mt-0.5 h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {orderItems.length} article{orderItems.length > 1 ? "s" : ""}
              </p>
              <ul className="mt-1 text-sm text-muted-foreground">
                {orderItems.slice(0, 3).map((item) => (
                  <li key={item.stockId}>
                    {item.quantity} {item.unit} de {item.productName}
                  </li>
                ))}
                {orderItems.length > 3 && (
                  <li>+ {orderItems.length - 3} autres...</li>
                )}
              </ul>
            </div>
          </div>

          {/* Cooperatives */}
          <div className="border-t border-border pt-3">
            <p className="text-sm text-muted-foreground">
              Fournisseur{cooperatives.length > 1 ? "s" : ""} :{" "}
              <span className="font-medium text-foreground">
                {cooperatives.join(", ")}
              </span>
            </p>
          </div>

          {/* Delivery Date */}
          {deliveryDate && (
            <div className="flex items-center gap-2 border-t border-border pt-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Livraison souhaitée : {new Date(deliveryDate).toLocaleDateString("fr-FR")}
              </span>
            </div>
          )}

          {/* Total */}
          <div className="border-t border-border pt-3">
            <div className="flex justify-between">
              <span className="font-medium text-foreground">Total</span>
              <span className="text-lg font-bold text-primary">
                {totalAmount.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button onClick={onViewOrders} className="w-full gap-2">
          Voir mes commandes
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Redirection automatique dans 5 secondes...
        </p>
      </div>
    </div>
  );
}
