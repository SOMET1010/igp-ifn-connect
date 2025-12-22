import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { StockItem } from "./types";

interface EditStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: StockItem | null;
  isSaving: boolean;
  onUpdate: (stockId: string, data: { quantity: number; minThreshold: number; unitPrice: number | null }) => Promise<boolean>;
}

export function EditStockDialog({ 
  open, 
  onOpenChange, 
  stock, 
  isSaving, 
  onUpdate 
}: EditStockDialogProps) {
  const [quantity, setQuantity] = useState("");
  const [minThreshold, setMinThreshold] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  useEffect(() => {
    if (stock) {
      setQuantity(String(stock.quantity));
      setMinThreshold(String(stock.min_threshold));
      setUnitPrice(stock.unit_price ? String(stock.unit_price) : "");
    }
  }, [stock]);

  const resetForm = () => {
    setQuantity("");
    setMinThreshold("");
    setUnitPrice("");
  };

  const handleSubmit = async () => {
    if (!stock) return;

    const success = await onUpdate(stock.id, {
      quantity: parseFloat(quantity) || 0,
      minThreshold: parseFloat(minThreshold) || 5,
      unitPrice: unitPrice ? parseFloat(unitPrice) : null,
    });

    if (success) {
      onOpenChange(false);
      resetForm();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier {stock?.product?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantité</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Seuil d'alerte</Label>
              <Input
                type="number"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                placeholder="5"
              />
            </div>
          </div>
          <div>
            <Label>Prix unitaire (FCFA)</Label>
            <Input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="Optionnel"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
