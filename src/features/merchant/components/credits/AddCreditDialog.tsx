import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { newCreditSchema, type NewCreditInput } from '../../types/credits.types';
import { useToast } from '@/hooks/use-toast';

interface AddCreditDialogProps {
  onSubmit: (input: NewCreditInput) => Promise<boolean>;
}

export function AddCreditDialog({ onSubmit }: AddCreditDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    amount_owed: '',
    due_date: '',
    notes: ''
  });

  const handleSubmit = async () => {
    // Validate with Zod
    const parsed = newCreditSchema.safeParse({
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone || undefined,
      amount_owed: parseFloat(formData.amount_owed) || 0,
      due_date: formData.due_date || undefined,
      notes: formData.notes || undefined
    });

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      toast({
        title: 'Erreur de validation',
        description: firstError?.message || 'Données invalides',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit(parsed.data);
    setIsSubmitting(false);

    if (success) {
      setFormData({
        customer_name: '',
        customer_phone: '',
        amount_owed: '',
        due_date: '',
        notes: ''
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-14 text-lg font-semibold rounded-xl shadow-africa">
          <Plus className="w-5 h-5 mr-2" /> Nouveau crédit client
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un crédit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-sm font-medium">Nom du client *</Label>
            <Input
              placeholder="Ex: Koné Amadou"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Téléphone</Label>
            <Input
              placeholder="07 XX XX XX XX"
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Montant *</Label>
            <Input
              type="number"
              placeholder="25000"
              value={formData.amount_owed}
              onChange={(e) => setFormData({ ...formData, amount_owed: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Date d'échéance</Label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Notes</Label>
            <Textarea
              placeholder="Détails supplémentaires..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1"
            />
          </div>
          <Button 
            onClick={handleSubmit} 
            className="w-full h-12 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
