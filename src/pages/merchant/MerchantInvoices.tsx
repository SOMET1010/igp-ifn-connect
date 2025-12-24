import { useState } from 'react';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { merchantNavItems } from '@/config/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Shield } from 'lucide-react';
import { FNEInvoice } from '@/components/merchant/FNEInvoice';
import { LoadingState, EmptyState } from '@/components/shared/StateComponents';
import { useInvoices } from '@/features/merchant/hooks/useInvoices';
import {
  InvoiceCard,
  CreateInvoiceDialog,
  CancelInvoiceDialog,
  InvoicesSummary,
  InvoicesFilters,
} from '@/features/merchant/components/invoices';
import { Invoice } from '@/features/merchant/types/invoices.types';

export default function MerchantInvoices() {
  const {
    filteredInvoices,
    isLoading,
    merchantData,
    filter,
    setFilter,
    issuedCount,
    cancelledCount,
    totalAmount,
    createInvoice,
    cancelInvoice,
    generatedInvoice,
    clearGeneratedInvoice,
  } = useInvoices();

  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null);

  // Show generated invoice preview
  if (generatedInvoice) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 max-w-md mx-auto">
          <FNEInvoice
            invoice={generatedInvoice}
            onClose={clearGeneratedInvoice}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <UnifiedHeader
        title="Mes Factures"
        subtitle="Factures Normalisées Électroniques"
        showBack
        backTo="/marchand"
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* FNE Info Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Format FNE Conforme</p>
            <p className="text-xs text-muted-foreground">
              Vos factures respectent le format DGI avec hash de sécurité et QR code de vérification.
            </p>
          </div>
        </div>

        {/* Summary */}
        <InvoicesSummary
          issuedCount={issuedCount}
          cancelledCount={cancelledCount}
          totalAmount={totalAmount}
        />

        {/* Create New Invoice Button */}
        <Button
          className="w-full h-16 rounded-2xl text-lg shadow-lg"
          onClick={() => setShowNewInvoice(true)}
        >
          <Plus className="w-6 h-6 mr-2" />
          Créer une nouvelle facture
        </Button>

        {/* Filters */}
        <InvoicesFilters filter={filter} onFilterChange={setFilter} />

        {/* Invoices List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Factures récentes
          </h2>

          {isLoading ? (
            <LoadingState message="Chargement des factures..." />
          ) : filteredInvoices.length === 0 ? (
            <EmptyState
              Icon={FileText}
              title="Aucune facture"
              message="Créez votre première facture normalisée"
            />
          ) : (
            <div className="space-y-3">
              {filteredInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onCancel={() => setInvoiceToCancel(invoice)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Dialog */}
      <CreateInvoiceDialog
        open={showNewInvoice}
        onOpenChange={setShowNewInvoice}
        merchantData={merchantData}
        onSubmit={createInvoice}
      />

      {/* Cancel Invoice Dialog */}
      <CancelInvoiceDialog
        invoice={invoiceToCancel}
        onConfirm={cancelInvoice}
        onClose={() => setInvoiceToCancel(null)}
      />

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
