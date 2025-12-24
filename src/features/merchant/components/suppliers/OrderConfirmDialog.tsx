// ============================================
// Component - Order Confirmation Dialog
// ============================================

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import type { CartItem } from "../../types/suppliers.types";

interface OrderConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  cartTotal: number;
  onConfirm: (deliveryDate: string, notes: string) => Promise<void>;
  submitting: boolean;
}

export function OrderConfirmDialog({
  open,
  onOpenChange,
  cart,
  cartTotal,
  onConfirm,
  submitting,
}: OrderConfirmDialogProps) {
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleConfirm = async () => {
    await onConfirm(deliveryDate, notes);
    setDeliveryDate("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-3xl">📦</span>
            Confirmer la commande
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <div className="p-4 bg-muted rounded-xl">
            <p className="font-medium mb-2">Récapitulatif</p>
            {cart.map((item) => (
              <div
                key={item.stockId}
                className="flex justify-between text-sm py-1"
              >
                <span>
                  {item.quantity} {item.unit} {item.productName}
                </span>
                <span className="font-medium">
                  {(item.quantity * item.unitPrice).toLocaleString()} F
                </span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary text-lg">
                {cartTotal.toLocaleString()} FCFA
              </span>
            </div>
          </div>

          {/* Delivery Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              Date de livraison souhaitée
            </Label>
            <Input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="h-12 text-base"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <span className="text-xl">📝</span>
              Notes (optionnel)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions de livraison..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700"
          >
            {submitting ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                Envoi en cours...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Confirmer ({cartTotal.toLocaleString()} FCFA)
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
