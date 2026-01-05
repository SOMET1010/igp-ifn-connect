import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAdminMapData } from '@/features/admin';
import { MapFilters, MapLegend, getIcon, TYPE_LABELS, initLeafletIcons } from '@/components/admin/map';

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
  const { filteredEntities, isLoading, filters, toggleFilter } = useAdminMapData();

  // Initialize Leaflet icons on mount
  useEffect(() => {
    initLeafletIcons();
  }, []);

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
      <MapFilters filters={filters} onToggle={toggleFilter} />

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

        <MapLegend />
      </div>
    </div>
  );
};

export default AdminMap;
