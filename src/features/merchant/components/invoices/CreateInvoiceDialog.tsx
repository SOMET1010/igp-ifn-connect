import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Shield, Loader2 } from 'lucide-react';
import { MerchantInvoiceData, NewInvoiceInput, newInvoiceSchema, formatInvoiceAmount, parseInvoiceAmount } from '../../types/invoices.types';

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantData: MerchantInvoiceData | null;
  onSubmit: (input: NewInvoiceInput, description: string) => Promise<boolean>;
}

export function CreateInvoiceDialog({ open, onOpenChange, merchantData, onSubmit }: CreateInvoiceDialogProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Vente marchandises diverses');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setAmount('');
    setDescription('Vente marchandises diverses');
    setCustomerName('');
    setCustomerPhone('');
    setErrors({});
  };

  const handleSubmit = async () => {
    const numericAmount = parseInvoiceAmount(amount);
    
    const input: NewInvoiceInput = {
      amount: numericAmount,
      description,
      customer_name: customerName || undefined,
      customer_phone: customerPhone || undefined,
    };

    const result = newInvoiceSchema.safeParse(input);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const success = await onSubmit(input, description);
    
    if (success) {
      resetForm();
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Nouvelle Facture FNE
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {merchantData?.fiscal_regime && (
            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Régime fiscal: <span className="font-medium text-foreground">{merchantData.fiscal_regime}</span>
              </span>
            </div>
          )}

          <div>
            <Label htmlFor="amount">Montant (FCFA) *</Label>
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              placeholder="Ex: 15 000"
              value={amount}
              onChange={(e) => setAmount(formatInvoiceAmount(e.target.value))}
              className={`text-xl font-bold h-14 ${errors.amount ? 'border-destructive' : ''}`}
            />
            {errors.amount && (
              <p className="text-sm text-destructive mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Description de la vente"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description}</p>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Informations client (optionnel)
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="customerName">Nom du client</Label>
                <Input
                  id="customerName"
                  placeholder="Ex: M. Kouassi Jean"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Téléphone du client</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="Ex: 07 00 00 00 00"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full h-12"
            onClick={handleSubmit}
            disabled={isSubmitting || !merchantData}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Générer la facture FNE
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
