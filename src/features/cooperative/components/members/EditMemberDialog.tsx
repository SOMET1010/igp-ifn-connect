/**
 * Dialog d'édition d'un membre
 */

import React, { useState, useEffect } from 'react';
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
import { Pencil } from 'lucide-react';
import type { CooperativeMember, AddMemberFormData } from '../../types/member.types';

interface EditMemberDialogProps {
  member: CooperativeMember;
  onUpdate: (data: { memberId: string; updates: Partial<AddMemberFormData> }) => void;
  isUpdating?: boolean;
}

export const EditMemberDialog: React.FC<EditMemberDialogProps> = ({
  member,
  onUpdate,
  isUpdating,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<AddMemberFormData>({
    full_name: member.full_name,
    phone: member.phone || '',
    cmu_status: member.cmu_status || 'Non',
    cnps_status: member.cnps_status || 'Non',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        full_name: member.full_name,
        phone: member.phone || '',
        cmu_status: member.cmu_status || 'Non',
        cnps_status: member.cnps_status || 'Non',
      });
    }
  }, [open, member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) return;

    onUpdate({ memberId: member.id, updates: formData });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le membre</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-full_name">Nom complet *</Label>
            <Input
              id="edit-full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Nom du membre"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">Téléphone</Label>
            <Input
              id="edit-phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ex: 07 00 00 00 00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Statut CMU</Label>
              <Select
                value={formData.cmu_status}
                onValueChange={(value) => setFormData({ ...formData, cmu_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Non">Non</SelectItem>
                  <SelectItem value="Oui">Oui</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut CNPS</Label>
              <Select
                value={formData.cnps_status}
                onValueChange={(value) => setFormData({ ...formData, cnps_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Non">Non</SelectItem>
                  <SelectItem value="Oui">Oui</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdating || !formData.full_name.trim()}>
              {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
