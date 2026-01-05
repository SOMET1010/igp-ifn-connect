/**
 * Dialog d'ajout d'un nouveau membre
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { addMemberSchema, type AddMemberFormData } from '../../types/member.types';
import { toast } from 'sonner';

interface AddMemberDialogProps {
  onAdd: (data: AddMemberFormData) => void;
  isAdding: boolean;
}

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({ onAdd, isAdding }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<AddMemberFormData>({
    full_name: '',
    phone: '',
    cmu_status: 'Non',
    cnps_status: 'Non',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = addMemberSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    onAdd(formData);
    setFormData({ full_name: '', phone: '', cmu_status: 'Non', cnps_status: 'Non' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Ajouter un membre
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau membre</DialogTitle>
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
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="07 XX XX XX XX"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cmu_status">Statut CMU</Label>
              <Select
                value={formData.cmu_status}
                onValueChange={(value) => setFormData({ ...formData, cmu_status: value })}
              >
                <SelectTrigger id="cmu_status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Non">Non affilié</SelectItem>
                  <SelectItem value="Oui">Affilié</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnps_status">Statut CNPS</Label>
              <Select
                value={formData.cnps_status}
                onValueChange={(value) => setFormData({ ...formData, cnps_status: value })}
              >
                <SelectTrigger id="cnps_status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Non">Non affilié</SelectItem>
                  <SelectItem value="Oui">Affilié</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
