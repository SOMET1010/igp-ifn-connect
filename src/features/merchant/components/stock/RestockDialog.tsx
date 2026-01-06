import { useState, useEffect } from "react";
import { Loader2, Check, X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pictogram } from "@/shared/ui";
import type { StockItem } from "./types";

interface RestockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: StockItem | null;
  isSaving: boolean;
  onRestock: (stockId: string, currentQuantity: number, addQuantity: number) => Promise<boolean>;
}

const QUICK_ADD_VALUES = [5, 10, 20, 50];

export function RestockDialog({ 
  open, 
  onOpenChange, 
  stock, 
  isSaving, 
  onRestock 
}: RestockDialogProps) {
  const [addQuantity, setAddQuantity] = useState(0);

  useEffect(() => {
    if (open) {
      setAddQuantity(0);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!stock || addQuantity <= 0) return;

    const success = await onRestock(
      stock.id, 
      Number(stock.quantity), 
      addQuantity
    );

    if (success) {
      onOpenChange(false);
      setAddQuantity(0);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setAddQuantity(0);
  };

  const handleQuickAdd = (value: number) => {
    setAddQuantity(prev => Math.max(0, prev + value));
  };

  const currentQty = Number(stock?.quantity || 0);
  const newQuantity = currentQty + addQuantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Pictogram type="restock" size="md" />
            Réapprovisionner
          </DialogTitle>
        </DialogHeader>

        {stock && (
          <div className="space-y-6">
            {/* Produit avec pictogramme */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
              <Pictogram type="stock" size="xl" />
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  {stock.product?.name}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Stock actuel:</span>
                  <span className="text-xl font-bold text-foreground">
                    {stock.quantity}
                  </span>
                  <span>{stock.product?.unit}</span>
                </div>
              </div>
            </div>

            {/* Zone quantité à ajouter */}
            <div className="text-center py-6 bg-secondary/10 rounded-2xl border-2 border-secondary/30">
              <p className="text-sm text-muted-foreground mb-2">Tu ajoutes combien ?</p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAddQuantity(prev => Math.max(0, prev - 1))}
                  className="h-14 w-14 rounded-full border-2"
                >
                  <Minus className="w-6 h-6" />
                </Button>
                <span className="text-5xl font-bold text-secondary min-w-[100px]">
                  +{addQuantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAddQuantity(prev => prev + 1)}
                  className="h-14 w-14 rounded-full border-2"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </div>
              <p className="text-lg text-muted-foreground mt-2">
                {stock.product?.unit}
              </p>
            </div>

            {/* Boutons rapides */}
            <div className="grid grid-cols-4 gap-2">
              {QUICK_ADD_VALUES.map(value => (
                <Button
                  key={value}
                  variant="outline"
                  onClick={() => handleQuickAdd(value)}
                  className="quick-add-btn h-14 text-lg font-bold border-2 border-secondary/50 text-secondary hover:bg-secondary/10"
                >
                  +{value}
                </Button>
              ))}
            </div>

            {/* Aperçu nouveau stock */}
            {addQuantity > 0 && (
              <div className="flex items-center justify-center gap-3 p-4 bg-muted/30 rounded-xl">
                <Pictogram type="in_stock" size="md" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Nouveau stock</p>
                  <p className="text-2xl font-bold text-foreground">
                    {newQuantity} {stock.product?.unit}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-14 text-lg"
              >
                <X className="w-5 h-5 mr-2" />
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={addQuantity <= 0 || isSaving}
                className="flex-1 h-14 text-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                {isSaving ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Check className="w-6 h-6 mr-2" />
                    Valider
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
