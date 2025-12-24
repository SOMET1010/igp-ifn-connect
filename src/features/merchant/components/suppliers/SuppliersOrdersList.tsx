// ============================================
// Component - Suppliers Orders List
// ============================================

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, CheckCircle, XCircle } from "lucide-react";
import type { SupplierOrder, OrderStatus } from "../../types/suppliers.types";
import { STATUS_CONFIG } from "../../types/suppliers.types";

interface SuppliersOrdersListProps {
  orders: SupplierOrder[];
  onCancelOrder: (orderId: string) => void;
  onBrowseCatalogue: () => void;
}

const StatusIcons = {
  clock: Clock,
  check: CheckCircle,
  truck: Truck,
  x: XCircle,
};

export function SuppliersOrdersList({
  orders,
  onCancelOrder,
  onBrowseCatalogue,
}: SuppliersOrdersListProps) {
  if (orders.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
          <Truck className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">
          Aucune commande passée
        </p>
        <Button variant="link" onClick={onBrowseCatalogue} className="mt-2">
          Parcourir le catalogue
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusConfig =
          STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG.pending;
        const StatusIcon = StatusIcons[statusConfig.iconName];

        return (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{order.products.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.cooperatives.name}
                  </p>
                </div>
                <Badge className={`${statusConfig.color} text-white`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="flex justify-between text-sm mt-3 pt-3 border-t">
                <span className="text-muted-foreground">
                  {order.quantity} {order.products.unit}
                </span>
                <span className="font-bold text-lg">
                  {order.total_amount.toLocaleString()} FCFA
                </span>
              </div>

              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("fr-FR")}
                </span>
                {order.status === "pending" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onCancelOrder(order.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Annuler
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
