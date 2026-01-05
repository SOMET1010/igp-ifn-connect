import React from 'react';
import { Button } from '@/components/ui/button';
import { Wheat, MapPin } from 'lucide-react';

export interface PublicMapFiltersState {
  markets: boolean;
  cooperatives: boolean;
}

interface PublicMapFiltersProps {
  filters: PublicMapFiltersState;
  onToggle: (key: keyof PublicMapFiltersState) => void;
  counts: { markets: number; cooperatives: number };
}

export const PublicMapFilters: React.FC<PublicMapFiltersProps> = ({ 
  filters, 
  onToggle,
  counts 
}) => {
  return (
    <div className="p-3 bg-card border-b flex items-center gap-2 overflow-x-auto z-[1000]">
      <Button
        size="sm"
        variant={filters.markets ? 'default' : 'outline'}
        onClick={() => onToggle('markets')}
        className={filters.markets ? 'bg-blue-600 hover:bg-blue-700' : ''}
      >
        <MapPin className="h-4 w-4 mr-1" />
        Marchés ({counts.markets})
      </Button>
      <Button
        size="sm"
        variant={filters.cooperatives ? 'default' : 'outline'}
        onClick={() => onToggle('cooperatives')}
        className={filters.cooperatives ? 'bg-amber-600 hover:bg-amber-700' : ''}
      >
        <Wheat className="h-4 w-4 mr-1" />
        Coopératives ({counts.cooperatives})
      </Button>
    </div>
  );
};
