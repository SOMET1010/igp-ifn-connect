import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Loader2, MapPin, Wheat } from 'lucide-react';
import { publicMapService, PublicMapEntity } from '@/features/public/services/publicMapService';
import { 
  PublicMapFilters, 
  PublicMapFiltersState, 
  PublicMapLegend, 
  getPublicMapIcon 
} from '@/components/public/map';

const TYPE_LABELS: Record<PublicMapEntity['type'], string> = {
  market: 'Marché',
  cooperative: 'Coopérative',
};

// Component to set map view
const SetViewOnLoad: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 7);
  }, [center, map]);
  return null;
};

const PublicMapPage: React.FC = () => {
  const navigate = useNavigate();
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

  // Center on Côte d'Ivoire
  const defaultCenter: [number, number] = [7.54, -5.55];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-4 sticky top-0 z-[1000]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 -ml-2 rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Carte PNAVIM</h1>
            <p className="text-sm text-white/80">
              {filteredEntities.length} point(s) sur la carte
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
              <MapPin className="h-4 w-4" />
              <span>{counts.markets}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
              <Wheat className="h-4 w-4" />
              <span>{counts.cooperatives}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <PublicMapFilters 
        filters={filters} 
        onToggle={toggleFilter} 
        counts={counts}
      />

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={defaultCenter}
          zoom={7}
          className="h-full w-full"
          style={{ height: 'calc(100vh - 140px)' }}
        >
          <SetViewOnLoad center={defaultCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredEntities.map((entity) => {
            const popupContent = `
              <div class="p-1 min-w-[140px]">
                <span class="inline-block px-2 py-0.5 text-xs font-medium rounded ${
                  entity.type === 'market' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-amber-100 text-amber-800'
                }">
                  ${TYPE_LABELS[entity.type]}
                </span>
                <p class="font-semibold mt-2 text-gray-900">${entity.name}</p>
                ${entity.details ? `<p class="text-sm text-gray-600">${entity.details}</p>` : ''}
              </div>
            `;
            return (
              <Marker
                key={`${entity.type}-${entity.id}`}
                position={[entity.lat, entity.lng]}
                icon={getPublicMapIcon(entity.type)}
                eventHandlers={{
                  click: (e) => {
                    L.popup()
                      .setLatLng(e.latlng)
                      .setContent(popupContent)
                      .openOn(e.target._map);
                  }
                }}
              />
            );
          })}
        </MapContainer>

        <PublicMapLegend />
      </div>
    </div>
  );
};

export default PublicMapPage;
