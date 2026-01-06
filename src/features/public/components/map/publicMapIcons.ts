import L from 'leaflet';

let iconsInitialized = false;
let marketIconInstance: L.Icon | null = null;
let cooperativeIconInstance: L.Icon | null = null;

export const initLeafletIcons = () => {
  if (iconsInitialized) return;
  
  // Fix default icon path
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });

  // Create custom icons
  marketIconInstance = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  cooperativeIconInstance = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  iconsInitialized = true;
};

// Lazy getters that initialize on first use
export const getMarketIcon = (): L.Icon => {
  if (!marketIconInstance) {
    initLeafletIcons();
  }
  return marketIconInstance!;
};

export const getCooperativeIcon = (): L.Icon => {
  if (!cooperativeIconInstance) {
    initLeafletIcons();
  }
  return cooperativeIconInstance!;
};

export const getPublicMapIcon = (type: 'market' | 'cooperative'): L.Icon => {
  switch (type) {
    case 'market': return getMarketIcon();
    case 'cooperative': return getCooperativeIcon();
    default: return getMarketIcon();
  }
};

// Legacy exports using getters for backward compatibility
export const marketIcon = getMarketIcon;
export const cooperativeIcon = getCooperativeIcon;
