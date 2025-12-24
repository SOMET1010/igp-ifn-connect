import { Button } from '@/components/ui/button';
import type { CreditFilter } from '../../types/credits.types';

interface CreditsFiltersProps {
  filter: CreditFilter;
  onFilterChange: (filter: CreditFilter) => void;
}

const FILTER_OPTIONS: Array<{ key: CreditFilter; label: string }> = [
  { key: 'all', label: 'Tous' },
  { key: 'pending', label: 'En cours' },
  { key: 'overdue', label: 'En retard' },
  { key: 'paid', label: 'Payés' }
];

export function CreditsFilters({ filter, onFilterChange }: CreditsFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {FILTER_OPTIONS.map((f) => (
        <Button
          key={f.key}
          variant={filter === f.key ? 'default' : 'outline'}
          size="sm"
          className="rounded-full whitespace-nowrap"
          onClick={() => onFilterChange(f.key)}
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}
