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

interface RestockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: StockItem | null;
  isSaving: boolean;
  onRestock: (stockId: string, currentQuantity: number, addQuantity: number) => Promise<boolean>;
}

export function RestockDialog({ 
  open, 
  onOpenChange, 
  stock, 
  isSaving, 
  onRestock 
}: RestockDialogProps) {
  const [restockQuantity, setRestockQuantity] = useState("");

  useEffect(() => {
    if (open) {
      setRestockQuantity("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!stock) return;

    const success = await onRestock(
      stock.id, 
      Number(stock.quantity), 
      parseFloat(restockQuantity) || 0
    );

    if (success) {
      onOpenChange(false);
      setRestockQuantity("");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setRestockQuantity("");
  };

  const newQuantity = Number(stock?.quantity || 0) + (parseFloat(restockQuantity) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réapprovisionner {stock?.product?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Stock actuel: {stock?.quantity} {stock?.product?.unit}
          </p>
          <div>
            <Label>Quantité à ajouter</Label>
            <Input
              type="number"
              value={restockQuantity}
              onChange={(e) => setRestockQuantity(e.target.value)}
              placeholder="0"
              autoFocus
            />
          </div>
          {restockQuantity && (
            <p className="text-sm text-muted-foreground">
              Nouveau stock: {newQuantity} {stock?.product?.unit}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!restockQuantity || isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Valider"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
