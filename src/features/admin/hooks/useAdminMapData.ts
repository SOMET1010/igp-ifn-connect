import { useState, useEffect } from 'react';
import { mapService } from '../services/mapService';
import type { MapEntity, MapFilters } from '../types/map.types';

export function useAdminMapData() {
  const [entities, setEntities] = useState<MapEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<MapFilters>({
    merchants: true,
    cooperatives: true,
    markets: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      const allEntities = await mapService.getAllEntities();
      setEntities(allEntities);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const filteredEntities = entities.filter(e => {
    if (e.type === 'merchant' && !filters.merchants) return false;
    if (e.type === 'cooperative' && !filters.cooperatives) return false;
    if (e.type === 'market' && !filters.markets) return false;
    return true;
  });

  const toggleFilter = (key: keyof MapFilters) => {
    setFilters(f => ({ ...f, [key]: !f[key] }));
  };

  return {
    entities,
    filteredEntities,
    isLoading,
    filters,
    toggleFilter,
  };
}
