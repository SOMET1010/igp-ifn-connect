/**
 * Dialog d'ajout d'un nouveau producteur
 */

import React, { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { REGIONS_CI } from '@/features/cooperative/types/profile.types';
import type { AddProducerInput } from '../../services/producerManagementService';

interface AddProducerDialogProps {
  onAdd: (data: AddProducerInput) => void;
  isAdding: boolean;
}

const SPECIALTIES = ['Manioc', 'Igname', 'Banane Plantain', 'Maïs', 'Riz', 'Arachide', 'Légumes'];

export const AddProducerDialog: React.FC<AddProducerDialogProps> = ({ onAdd, isAdding }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<AddProducerInput>({
    full_name: '',
    phone: '',
    region: '',
    commune: '',
    specialties: [],
    igp_certified: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name || !formData.phone || !formData.region || !formData.commune) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onAdd(formData);
    setFormData({ full_name: '', phone: '', region: '', commune: '', specialties: [], igp_certified: false });
    setOpen(false);
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties?.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...(prev.specialties || []), specialty]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Ajouter un producteur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau producteur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nom complet *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Nom et prénom"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="07 XX XX XX XX"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Région *</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => setFormData({ ...formData, region: value })}
              >
                <SelectTrigger id="region">
                  <SelectValue placeholder="Région" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS_CI.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commune">Commune *</Label>
              <Input
                id="commune"
                value={formData.commune}
                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                placeholder="Commune"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Spécialités</Label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((specialty) => (
                <Button
                  key={specialty}
                  type="button"
                  variant={formData.specialties?.includes(specialty) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleSpecialty(specialty)}
                  className="text-xs"
                >
                  {specialty}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="igp_certified"
              checked={formData.igp_certified}
              onCheckedChange={(checked) => setFormData({ ...formData, igp_certified: !!checked })}
            />
            <Label htmlFor="igp_certified" className="text-sm font-normal cursor-pointer">
              Certification IGP
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ajout...
                </>
              ) : (
                'Ajouter'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
