import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Store, Wheat, MapPin } from 'lucide-react';
import { MapFilters as MapFiltersType } from './types';

interface MapFiltersProps {
  filters: MapFiltersType;
  onToggle: (key: keyof MapFiltersType) => void;
}

export const MapFilters: React.FC<MapFiltersProps> = ({ filters, onToggle }) => {
  return (
    <div className="p-3 bg-card border-b flex items-center gap-2 overflow-x-auto z-[1000]">
      <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
      <Button
        size="sm"
        variant={filters.merchants ? 'default' : 'outline'}
        onClick={() => onToggle('merchants')}
        className={filters.merchants ? 'bg-green-600 hover:bg-green-700' : ''}
      >
        <Store className="h-4 w-4 mr-1" />
        Marchands
      </Button>
      <Button
        size="sm"
        variant={filters.cooperatives ? 'default' : 'outline'}
        onClick={() => onToggle('cooperatives')}
        className={filters.cooperatives ? 'bg-amber-600 hover:bg-amber-700' : ''}
      >
        <Wheat className="h-4 w-4 mr-1" />
        Coopératives
      </Button>
      <Button
        size="sm"
        variant={filters.markets ? 'default' : 'outline'}
        onClick={() => onToggle('markets')}
        className={filters.markets ? 'bg-blue-600 hover:bg-blue-700' : ''}
      >
        <MapPin className="h-4 w-4 mr-1" />
        Marchés
      </Button>
    </div>
  );
};
