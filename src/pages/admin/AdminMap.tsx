import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ArrowLeft,
  Loader2,
  Store,
  Wheat,
  MapPin,
  Filter
} from 'lucide-react';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const merchantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const cooperativeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const marketIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapEntity {
  id: string;
  type: 'merchant' | 'cooperative' | 'market';
  name: string;
  lat: number;
  lng: number;
  details?: string;
}

// Component to set map view
const SetViewOnLoad: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 7);
  }, [center, map]);
  return null;
};

const AdminMap: React.FC = () => {
  const navigate = useNavigate();
  
  const [entities, setEntities] = useState<MapEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    merchants: true,
    cooperatives: true,
    markets: true
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
              details: m.activity_type
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
              details: `${c.commune}, ${c.region}`
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
              details: `${m.commune}, ${m.region}`
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'merchant': return merchantIcon;
      case 'cooperative': return cooperativeIcon;
      case 'market': return marketIcon;
      default: return merchantIcon;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'merchant': return 'Marchand';
      case 'cooperative': return 'Coopérative';
      case 'market': return 'Marché';
      default: return '';
    }
  };

  // Center on Côte d'Ivoire
  const defaultCenter: [number, number] = [7.54, -5.55];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-violet-800 to-violet-700 text-white p-4 sticky top-0 z-[1000]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Cartographie</h1>
            <p className="text-sm text-white/80">{filteredEntities.length} point(s) sur la carte</p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="p-3 bg-card border-b flex items-center gap-2 overflow-x-auto z-[1000]">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <Button
          size="sm"
          variant={filters.merchants ? 'default' : 'outline'}
          onClick={() => setFilters(f => ({ ...f, merchants: !f.merchants }))}
          className={filters.merchants ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <Store className="h-4 w-4 mr-1" />
          Marchands
        </Button>
        <Button
          size="sm"
          variant={filters.cooperatives ? 'default' : 'outline'}
          onClick={() => setFilters(f => ({ ...f, cooperatives: !f.cooperatives }))}
          className={filters.cooperatives ? 'bg-amber-600 hover:bg-amber-700' : ''}
        >
          <Wheat className="h-4 w-4 mr-1" />
          Coopératives
        </Button>
        <Button
          size="sm"
          variant={filters.markets ? 'default' : 'outline'}
          onClick={() => setFilters(f => ({ ...f, markets: !f.markets }))}
          className={filters.markets ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          <MapPin className="h-4 w-4 mr-1" />
          Marchés
        </Button>
      </div>

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
              <div class="p-1 min-w-[120px]">
                <span class="inline-block px-2 py-0.5 text-xs font-medium rounded ${
                  entity.type === 'merchant' ? 'bg-green-100 text-green-800' :
                  entity.type === 'cooperative' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }">
                  ${getTypeLabel(entity.type)}
                </span>
                <p class="font-semibold mt-2 text-gray-900">${entity.name}</p>
                ${entity.details ? `<p class="text-sm text-gray-600">${entity.details}</p>` : ''}
              </div>
            `;
            return (
              <Marker
                key={`${entity.type}-${entity.id}`}
                position={[entity.lat, entity.lng]}
                icon={getIcon(entity.type)}
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

        {/* Legend */}
        <Card className="absolute bottom-4 left-4 z-[1000]">
          <CardContent className="p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Légende</p>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Marchands</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span>Coopératives</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Marchés</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMap;
