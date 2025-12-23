import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MapEntity {
  id: string;
  type: 'merchant' | 'cooperative' | 'market';
  name: string;
  lat: number;
  lng: number;
  details?: string;
}

export interface MapFilters {
  merchants: boolean;
  cooperatives: boolean;
  markets: boolean;
}

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
      const allEntities: MapEntity[] = [];

      // Fetch merchants with coordinates
      const { data: merchants } = await supabase
        .from('merchants')
        .select('id, full_name, activity_type, latitude, longitude')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (merchants) {
        merchants.forEach(m => {
          if (m.latitude && m.longitude) {
            allEntities.push({
              id: m.id,
              type: 'merchant',
              name: m.full_name,
              lat: Number(m.latitude),
              lng: Number(m.longitude),
              details: m.activity_type,
            });
          }
        });
      }

      // Fetch cooperatives with coordinates
      const { data: cooperatives } = await supabase
        .from('cooperatives')
        .select('id, name, region, commune, latitude, longitude')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (cooperatives) {
        cooperatives.forEach(c => {
          if (c.latitude && c.longitude) {
            allEntities.push({
              id: c.id,
              type: 'cooperative',
              name: c.name,
              lat: Number(c.latitude),
              lng: Number(c.longitude),
              details: `${c.commune}, ${c.region}`,
            });
          }
        });
      }

      // Fetch markets with coordinates
      const { data: markets } = await supabase
        .from('markets')
        .select('id, name, commune, region, latitude, longitude')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (markets) {
        markets.forEach(m => {
          if (m.latitude && m.longitude) {
            allEntities.push({
              id: m.id,
              type: 'market',
              name: m.name,
              lat: Number(m.latitude),
              lng: Number(m.longitude),
              details: `${m.commune}, ${m.region}`,
            });
          }
        });
      }

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
