import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Shield, XCircle } from 'lucide-react';
import { Invoice, isInvoiceCancelled } from '../../types/invoices.types';

interface InvoiceCardProps {
  invoice: Invoice;
  onCancel: () => void;
}

export function InvoiceCard({ invoice, onCancel }: InvoiceCardProps) {
  const isCancelled = isInvoiceCancelled(invoice);

  return (
    <Card className={`hover:shadow-md transition-shadow ${isCancelled ? 'opacity-60 border-destructive/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isCancelled ? 'bg-destructive/10' : 'bg-primary/10'
            }`}>
              {isCancelled ? (
                <XCircle className="w-6 h-6 text-destructive" />
              ) : (
                <FileText className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <p className={`font-mono font-bold ${isCancelled ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {invoice.invoice_number}
              </p>
              <p className="text-sm text-muted-foreground">
                {invoice.customer_name || 'Client non spécifié'}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                </div>
                {invoice.signature_hash && !isCancelled && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Shield className="w-3 h-3" />
                    <span className="font-mono">{invoice.signature_hash.substring(0, 8)}...</span>
                  </div>
                )}
                {isCancelled && (
                  <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                    Annulée
                  </span>
                )}
              </div>
              {isCancelled && invoice.cancellation_reason && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  Motif: {invoice.cancellation_reason}
                </p>
              )}
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div>
              <p className={`font-bold text-lg ${isCancelled ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {Number(invoice.amount_ttc).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">FCFA</p>
            </div>
            {!isCancelled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 text-xs"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Annuler
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
