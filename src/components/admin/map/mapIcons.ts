import L from 'leaflet';

let iconsInitialized = false;
let merchantIconInstance: L.Icon | null = null;
let cooperativeIconInstance: L.Icon | null = null;
let marketIconInstance: L.Icon | null = null;

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
  merchantIconInstance = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
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

  marketIconInstance = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  iconsInitialized = true;
};

// Lazy getters that initialize on first use
export const getMerchantIcon = (): L.Icon => {
  if (!merchantIconInstance) initLeafletIcons();
  return merchantIconInstance!;
};

export const getCooperativeIcon = (): L.Icon => {
  if (!cooperativeIconInstance) initLeafletIcons();
  return cooperativeIconInstance!;
};

export const getMarketIcon = (): L.Icon => {
  if (!marketIconInstance) initLeafletIcons();
  return marketIconInstance!;
};

export type EntityType = 'merchant' | 'cooperative' | 'market';

export const getIcon = (type: string): L.Icon => {
  switch (type) {
    case 'merchant': return getMerchantIcon();
    case 'cooperative': return getCooperativeIcon();
    case 'market': return getMarketIcon();
    default: return getMerchantIcon();
  }
};

// Legacy exports using getters for backward compatibility
export const merchantIcon = getMerchantIcon;
export const cooperativeIcon = getCooperativeIcon;
export const marketIcon = getMarketIcon;
