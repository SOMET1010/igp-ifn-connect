import { FileText, XCircle, Banknote } from 'lucide-react';
import { StatCard } from '@/shared/ui';

interface InvoicesSummaryProps {
  issuedCount: number;
  cancelledCount: number;
  totalAmount: number;
}

export function InvoicesSummary({ issuedCount, cancelledCount, totalAmount }: InvoicesSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        icon={FileText}
        value={issuedCount}
        title="Émises"
        variant="primary"
      />
      <StatCard
        icon={Banknote}
        value={`${(totalAmount / 1000).toFixed(0)}K`}
        title="Total FCFA"
        variant="success"
      />
      <StatCard
        icon={XCircle}
        value={cancelledCount}
        title="Annulées"
        variant="warning"
      />
    </div>
  );
}
