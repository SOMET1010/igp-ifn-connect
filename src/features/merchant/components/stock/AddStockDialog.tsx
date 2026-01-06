import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "./types";

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableProducts: Product[];
  isSaving: boolean;
  onAdd: (data: { productId: string; quantity: number; minThreshold: number; unitPrice: number | null }) => Promise<boolean>;
}

export function AddStockDialog({ 
  open, 
  onOpenChange, 
  availableProducts, 
  isSaving, 
  onAdd 
}: AddStockDialogProps) {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minThreshold, setMinThreshold] = useState("5");
  const [unitPrice, setUnitPrice] = useState("");

  const resetForm = () => {
    setSelectedProductId("");
    setQuantity("");
    setMinThreshold("5");
    setUnitPrice("");
  };

  const handleSubmit = async () => {
    const success = await onAdd({
      productId: selectedProductId,
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
          <DialogTitle>Ajouter un produit au stock</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Produit</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantité initiale</Label>
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
            disabled={!selectedProductId || isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
