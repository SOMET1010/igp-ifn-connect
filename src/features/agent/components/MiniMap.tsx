import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MiniMapProps {
  latitude: number;
  longitude: number;
  className?: string;
}

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export function MiniMap({ latitude, longitude, className }: MiniMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainer.current, {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "",
      }).addTo(mapRef.current);

      // Custom marker icon with primary color
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)));
          width: 24px;
          height: 24px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      markerRef.current = L.marker([latitude, longitude], { icon: customIcon }).addTo(
        mapRef.current
      );
    } else {
      // Update position
      mapRef.current.setView([latitude, longitude], 16);
      markerRef.current?.setLatLng([latitude, longitude]);
    }

    return () => {
      // Cleanup on unmount
    };
  }, [latitude, longitude]);

  // Cleanup map on component unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      className={`w-full h-44 rounded-xl overflow-hidden border-2 border-secondary/30 ${className || ""}`}
    />
  );
}
