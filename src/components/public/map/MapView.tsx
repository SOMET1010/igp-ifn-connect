import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PublicMapEntity } from '@/features/public/services/publicMapService';
import { initLeafletIcons, getPublicMapIcon } from './publicMapIcons';

interface MapViewProps {
  entities: PublicMapEntity[];
  typeLabels: Record<PublicMapEntity['type'], string>;
}

// Component to set map view
const SetViewOnLoad: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 7);
  }, [center, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ entities, typeLabels }) => {
  // Center on Côte d'Ivoire
  const defaultCenter: [number, number] = [7.54, -5.55];

  // Initialize Leaflet icons on mount
  useEffect(() => {
    initLeafletIcons();
  }, []);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={7}
      className="h-full w-full"
      style={{ height: 'calc(100vh - 180px)' }}
    >
      <SetViewOnLoad center={defaultCenter} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {entities.map((entity) => {
        const popupContent = `
          <div class="p-1 min-w-[140px]">
            <span class="inline-block px-2 py-0.5 text-xs font-medium rounded ${
              entity.type === 'market' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-amber-100 text-amber-800'
            }">
              ${typeLabels[entity.type]}
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
  );
};

export default MapView;
