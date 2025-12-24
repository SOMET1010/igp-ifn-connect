import { Button } from "@/components/ui/button";
import type { PromotionFilter } from "../../types/promotions.types";

interface PromotionsFiltersProps {
  filter: PromotionFilter;
  onFilterChange: (filter: PromotionFilter) => void;
}

const FILTERS: { key: PromotionFilter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "active", label: "Actives" },
  { key: "expired", label: "Expirées" },
];

export function PromotionsFilters({ filter, onFilterChange }: PromotionsFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {FILTERS.map((f) => (
        <Button
          key={f.key}
          variant={filter === f.key ? "default" : "outline"}
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
