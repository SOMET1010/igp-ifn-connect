/**
 * Dialog de création de commande au producteur
 */

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AvailableHarvest, CreateProducerOrderInput } from '../../types/producerOrder.types';
import type { Producer } from '@/features/producer/types/producer.types';

interface CreateOrderDialogProps {
  harvests: AvailableHarvest[];
  producers: Producer[];
  onSubmit: (data: CreateProducerOrderInput) => void;
  isCreating: boolean;
}

export const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({ 
  harvests, 
  producers,
  onSubmit, 
  isCreating 
}) => {
  const [open, setOpen] = useState(false);
  const [selectedHarvestId, setSelectedHarvestId] = useState<string>('');
  const [selectedProducerId, setSelectedProducerId] = useState<string>('');
  const [formData, setFormData] = useState({
    quantity: '',
    unit_price: '',
    delivery_date: '',
    notes: '',
  });

  const selectedHarvest = useMemo(() => 
    harvests.find(h => h.id === selectedHarvestId),
    [harvests, selectedHarvestId]
  );

  const handleHarvestSelect = (harvestId: string) => {
    setSelectedHarvestId(harvestId);
    const harvest = harvests.find(h => h.id === harvestId);
    if (harvest) {
      setSelectedProducerId(harvest.producer_id);
      setFormData(prev => ({
        ...prev,
        unit_price: harvest.unit_price.toString(),
        quantity: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProducerId) {
      toast.error('Sélectionnez un producteur');
      return;
    }

    if (!selectedHarvest && !formData.quantity) {
      toast.error('Veuillez saisir une quantité');
      return;
    }

    const quantity = parseFloat(formData.quantity);
    const unitPrice = parseFloat(formData.unit_price);

    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Quantité invalide');
      return;
    }

    if (isNaN(unitPrice) || unitPrice <= 0) {
      toast.error('Prix unitaire invalide');
      return;
    }

    if (selectedHarvest && quantity > selectedHarvest.available_quantity) {
      toast.error(`Quantité maximale disponible: ${selectedHarvest.available_quantity}`);
      return;
    }

    onSubmit({
      producer_id: selectedProducerId,
      product_id: selectedHarvest?.product_id || '',
      harvest_id: selectedHarvestId || undefined,
      quantity,
      unit_price: unitPrice,
      delivery_date: formData.delivery_date || undefined,
      notes: formData.notes || undefined,
    });

    // Reset form
    setSelectedHarvestId('');
    setSelectedProducerId('');
    setFormData({ quantity: '', unit_price: '', delivery_date: '', notes: '' });
    setOpen(false);
  };

  const totalAmount = parseFloat(formData.quantity || '0') * parseFloat(formData.unit_price || '0');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          Nouvelle commande
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Commander une récolte</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection de la récolte disponible */}
          <div className="space-y-2">
            <Label>Récolte disponible</Label>
            <Select value={selectedHarvestId} onValueChange={handleHarvestSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une récolte" />
              </SelectTrigger>
              <SelectContent>
                {harvests.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Aucune récolte disponible
                  </SelectItem>
                ) : (
                  harvests.map((harvest) => (
                    <SelectItem key={harvest.id} value={harvest.id}>
                      {harvest.product?.name} - {harvest.producer?.full_name} 
                      ({harvest.available_quantity} {harvest.product?.unit} @ {harvest.unit_price} FCFA)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedHarvest && (
            <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
              <p><strong>Produit:</strong> {selectedHarvest.product?.name}</p>
              <p><strong>Producteur:</strong> {selectedHarvest.producer?.full_name}</p>
              <p><strong>Disponible:</strong> {selectedHarvest.available_quantity} {selectedHarvest.product?.unit}</p>
              <p><strong>Qualité:</strong> {selectedHarvest.quality_grade || 'Non spécifiée'}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantité {selectedHarvest && `(max: ${selectedHarvest.available_quantity})`} *
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                min="1"
                max={selectedHarvest?.available_quantity}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">Prix unitaire (FCFA) *</Label>
              <Input
                id="unit_price"
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                placeholder="0"
                min="1"
                required
              />
            </div>
          </div>

          {totalAmount > 0 && (
            <div className="bg-primary/10 p-3 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Montant total</p>
              <p className="text-2xl font-bold text-primary">{totalAmount.toLocaleString()} FCFA</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="delivery_date">Date de livraison souhaitée</Label>
            <Input
              id="delivery_date"
              type="date"
              value={formData.delivery_date}
              onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Instructions particulières..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isCreating || !selectedHarvestId}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Commander'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
