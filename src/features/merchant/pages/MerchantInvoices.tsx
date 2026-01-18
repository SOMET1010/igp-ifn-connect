/**
 * Page Factures - /marchand/factures
 * Refactorisée avec Design System Jùlaba
 */

import { useState } from 'react';
import { 
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaButton,
  JulabaStatCard,
  JulabaEmptyState,
  JulabaBottomNav,
} from '@/shared/ui/julaba';
import { MERCHANT_NAV_ITEMS } from '@/config/navigation-julaba';
import { LoadingState } from '@/shared/ui';
import { FNEInvoice } from '@/features/merchant/components/FNEInvoice';
import { useInvoices } from '@/features/merchant/hooks/useInvoices';
import {
  InvoiceCard,
  CreateInvoiceDialog,
  CancelInvoiceDialog,
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
      <JulabaPageLayout background="warm">
        <div className="p-4 max-w-md mx-auto">
          <FNEInvoice
            invoice={generatedInvoice}
            onClose={clearGeneratedInvoice}
          />
        </div>
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="warm" className="pb-24">
      <JulabaHeader
        title="📜 Mes Factures"
        backPath="/marchand"
      />

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {/* FNE Info Banner */}
        <JulabaCard accent="blue">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-bold text-foreground">Format FNE Conforme</p>
              <p className="text-sm text-muted-foreground">
                Tes factures respectent le format DGI avec sécurité et QR code.
              </p>
            </div>
          </div>
        </JulabaCard>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <JulabaStatCard
            emoji="📄"
            value={issuedCount}
            label="Émises"
            iconBg="blue"
          />
          <JulabaStatCard
            emoji="❌"
            value={cancelledCount}
            label="Annulées"
            iconBg="orange"
          />
          <JulabaStatCard
            emoji="💰"
            value={`${Math.round(totalAmount / 1000)}k`}
            label="Total"
            iconBg="green"
          />
        </div>

        {/* Create New Invoice Button */}
        <JulabaButton
          variant="hero"
          emoji="➕"
          className="w-full"
          onClick={() => setShowNewInvoice(true)}
        >
          Créer une facture
        </JulabaButton>

        {/* Filters */}
        <InvoicesFilters filter={filter} onFilterChange={setFilter} />

        {/* Invoices List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>📋</span> Factures récentes
          </h2>

          {isLoading ? (
            <LoadingState message="Chargement des factures..." />
          ) : filteredInvoices.length === 0 ? (
            <JulabaEmptyState
              emoji="📜"
              title="Aucune facture"
              description="Crée ta première facture normalisée"
              action={{
                label: "Créer maintenant",
                onClick: () => setShowNewInvoice(true),
              }}
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
      </main>

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

      <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />
    </JulabaPageLayout>
  );
}
