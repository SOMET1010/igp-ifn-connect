import { Button } from '@/components/ui/button';
import { InvoiceFilter } from '../../types/invoices.types';

interface InvoicesFiltersProps {
  filter: InvoiceFilter;
  onFilterChange: (filter: InvoiceFilter) => void;
}

const FILTERS: { value: InvoiceFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'issued', label: 'Émises' },
  { value: 'cancelled', label: 'Annulées' },
];

export function InvoicesFilters({ filter, onFilterChange }: InvoicesFiltersProps) {
  return (
    <div className="flex gap-2">
      {FILTERS.map(({ value, label }) => (
        <Button
          key={value}
          variant={filter === value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(value)}
          className="flex-1"
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
