import { FileText, XCircle, Banknote } from 'lucide-react';
import { UnifiedStatCard } from '@/components/shared/UnifiedStatCard';

interface InvoicesSummaryProps {
  issuedCount: number;
  cancelledCount: number;
  totalAmount: number;
}

export function InvoicesSummary({ issuedCount, cancelledCount, totalAmount }: InvoicesSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <UnifiedStatCard
        icon={FileText}
        value={issuedCount}
        title="Émises"
        variant="primary"
      />
      <UnifiedStatCard
        icon={Banknote}
        value={`${(totalAmount / 1000).toFixed(0)}K`}
        title="Total FCFA"
        variant="success"
      />
      <UnifiedStatCard
        icon={XCircle}
        value={cancelledCount}
        title="Annulées"
        variant="warning"
      />
    </div>
  );
}
