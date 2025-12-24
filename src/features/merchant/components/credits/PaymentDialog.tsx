import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { paymentSchema, type CustomerCredit } from '../../types/credits.types';
import { useToast } from '@/hooks/use-toast';

interface PaymentDialogProps {
  credit: CustomerCredit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (credit: CustomerCredit, amount: number) => Promise<boolean>;
}

export function PaymentDialog({ credit, open, onOpenChange, onSubmit }: PaymentDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset amount when dialog closes
  useEffect(() => {
    if (!open) {
      setAmount('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!credit) return;

    // Validate with Zod
    const parsed = paymentSchema.safeParse({
      amount: parseFloat(amount) || 0
    });

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      toast({
        title: 'Erreur de validation',
        description: firstError?.message || 'Montant invalide',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit(credit, parsed.data.amount);
    setIsSubmitting(false);

    if (success) {
      onOpenChange(false);
    }
  };

  const remaining = credit ? credit.amount_owed - credit.amount_paid : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Encaisser un paiement</DialogTitle>
        </DialogHeader>
        {credit && (
          <div className="space-y-4 mt-4">
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <p className="font-bold">{credit.customer_name}</p>
                <p className="text-sm text-muted-foreground">
                  Reste à payer:{' '}
                  <span className="text-primary font-bold">
                    {remaining.toLocaleString()} FCFA
                  </span>
                </p>
              </CardContent>
            </Card>
            <div>
              <Label className="text-sm font-medium">Montant reçu</Label>
              <Input
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 h-14 text-xl text-center"
              />
            </div>
            <Button 
              onClick={handleSubmit} 
              className="w-full h-12 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Traitement...' : 'Confirmer le paiement'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
