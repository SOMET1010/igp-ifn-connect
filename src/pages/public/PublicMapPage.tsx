import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { Loader2, MapPin, Wheat } from 'lucide-react';
import { publicMapService, PublicMapEntity } from '@/features/public/services/publicMapService';
import { 
  PublicMapFilters, 
  PublicMapFiltersState, 
  PublicMapLegend
} from '@/features/public/components/map';
import { PageLayout } from '@/templates';

const TYPE_LABELS: Record<PublicMapEntity['type'], string> = {
  market: 'Marché',
  cooperative: 'Coopérative',
};

// Lazy load the map component to avoid SSR issues
const MapView = lazy(() => import('@/features/public/components/map/MapView'));

const PublicMapPage: React.FC = () => {
  const [entities, setEntities] = useState<PublicMapEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PublicMapFiltersState>({
    markets: true,
    cooperatives: true,
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await publicMapService.getAllEntities();
        setEntities(data);
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFilter = useCallback((key: keyof PublicMapFiltersState) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Filter entities based on active filters
  const filteredEntities = entities.filter(entity => {
    if (entity.type === 'market' && !filters.markets) return false;
    if (entity.type === 'cooperative' && !filters.cooperatives) return false;
    return true;
  });

  // Count by type
  const counts = {
    markets: entities.filter(e => e.type === 'market').length,
    cooperatives: entities.filter(e => e.type === 'cooperative').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Header right content with counts
  const headerRightContent = (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1 bg-primary/20 px-2 py-1 rounded-full">
        <MapPin className="h-4 w-4" />
        <span>{counts.markets}</span>
      </div>
      <div className="flex items-center gap-1 bg-primary/20 px-2 py-1 rounded-full">
        <Wheat className="h-4 w-4" />
        <span>{counts.cooperatives}</span>
      </div>
    </div>
  );

  return (
    <PageLayout
      title="Carte JÙLABA"
      subtitle={`${filteredEntities.length} point(s) sur la carte`}
      showBack
      backTo="/"
      headerRightContent={headerRightContent}
      withPadding={false}
    >
      {/* Filters */}
      <PublicMapFilters 
        filters={filters} 
        onToggle={toggleFilter} 
        counts={counts}
      />

      {/* Map - Lazy loaded */}
      <div className="flex-1 relative">
        <Suspense fallback={
          <div className="h-full w-full flex items-center justify-center" style={{ height: 'calc(100vh - 180px)' }}>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        }>
          <MapView 
            entities={filteredEntities} 
            typeLabels={TYPE_LABELS}
          />
        </Suspense>

        <PublicMapLegend />
      </div>
    </PageLayout>
  );
};

export default PublicMapPage;
