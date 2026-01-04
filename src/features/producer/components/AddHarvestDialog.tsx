/**
 * Dialog pour ajouter/modifier une récolte
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import type { HarvestFormData, ProducerHarvest, QualityGrade } from '../types/producer.types';

interface AddHarvestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HarvestFormData) => void;
  isLoading?: boolean;
  editHarvest?: ProducerHarvest;
}

export const AddHarvestDialog: React.FC<AddHarvestDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  editHarvest,
}) => {
  const [formData, setFormData] = useState<HarvestFormData>({
    product_id: '',
    quantity: 0,
    unit_price: 0,
    harvest_date: new Date().toISOString().split('T')[0],
    quality_grade: undefined,
    notes: '',
  });

  const { data: products } = useQuery({
    queryKey: ['products-for-harvest'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, unit')
        .order('name');
      return data || [];
    },
  });

  useEffect(() => {
    if (editHarvest) {
      setFormData({
        product_id: editHarvest.product_id,
        quantity: editHarvest.quantity,
        unit_price: editHarvest.unit_price,
        harvest_date: editHarvest.harvest_date,
        expiry_date: editHarvest.expiry_date || undefined,
        quality_grade: editHarvest.quality_grade || undefined,
        notes: editHarvest.notes || '',
      });
    } else {
      setFormData({
        product_id: '',
        quantity: 0,
        unit_price: 0,
        harvest_date: new Date().toISOString().split('T')[0],
        quality_grade: undefined,
        notes: '',
      });
    }
  }, [editHarvest, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || formData.quantity <= 0 || formData.unit_price <= 0) {
      return;
    }
    onSubmit(formData);
  };

  const selectedProduct = products?.find(p => p.id === formData.product_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editHarvest ? 'Modifier la récolte' : 'Publier une récolte'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Produit *</Label>
            <Select
              value={formData.product_id}
              onValueChange={(value) => setFormData({ ...formData, product_id: value })}
              disabled={!!editHarvest}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantité * {selectedProduct && `(${selectedProduct.unit})`}</Label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 100"
              />
            </div>
            <div className="space-y-2">
              <Label>Prix unitaire (FCFA) *</Label>
              <Input
                type="number"
                min="1"
                value={formData.unit_price || ''}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de récolte *</Label>
              <Input
                type="date"
                value={formData.harvest_date}
                onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date d'expiration</Label>
              <Input
                type="date"
                value={formData.expiry_date || ''}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value || undefined })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Grade qualité</Label>
            <Select
              value={formData.quality_grade || ''}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                quality_grade: value as QualityGrade || undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Optionnel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Grade A - Premium</SelectItem>
                <SelectItem value="B">Grade B - Standard</SelectItem>
                <SelectItem value="C">Grade C - Économique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>

          {formData.quantity > 0 && formData.unit_price > 0 && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Valeur totale</p>
              <p className="text-lg font-bold">
                {new Intl.NumberFormat('fr-FR').format(formData.quantity * formData.unit_price)} FCFA
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !formData.product_id || formData.quantity <= 0 || formData.unit_price <= 0}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editHarvest ? (
                'Enregistrer'
              ) : (
                'Publier'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
