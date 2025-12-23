import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { CooperativeProduct } from './types';

interface AddStockDialogProps {
  products: CooperativeProduct[];
  isSaving: boolean;
  onAdd: (data: { productId: string; quantity: number; unitPrice: number | null }) => Promise<boolean>;
}

export const AddStockDialog: React.FC<AddStockDialogProps> = ({
  products,
  isSaving,
  onAdd,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  const resetForm = () => {
    setSelectedProduct('');
    setQuantity('');
    setUnitPrice('');
  };

  const handleSubmit = async () => {
    const success = await onAdd({
      productId: selectedProduct,
      quantity: parseFloat(quantity),
      unitPrice: unitPrice ? parseFloat(unitPrice) : null,
    });

    if (success) {
      resetForm();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1">
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un produit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter au stock</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Produit</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantité</Label>
            <Input
              type="number"
              placeholder="Ex: 100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Prix unitaire (FCFA) - optionnel</Label>
            <Input
              type="number"
              placeholder="Ex: 500"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSaving || !selectedProduct || !quantity}
            className="w-full"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Ajouter'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
