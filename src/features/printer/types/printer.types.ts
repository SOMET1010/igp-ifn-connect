/**
 * Types pour le module imprimante Bluetooth ESC/POS
 * Module: printer
 */

// État de connexion de l'imprimante
export type PrinterConnectionStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

// Configuration imprimante
export interface PrinterConfig {
  chunkSize: number;        // Taille des chunks en bytes (défaut: 20)
  chunkDelay: number;       // Délai entre chunks en ms (défaut: 50)
  paperWidth: number;       // Largeur papier en caractères (32 pour 58mm)
  encoding: 'utf-8' | 'cp437';
}

// Informations appareil connecté
export interface PrinterDevice {
  id: string;
  name: string;
  connected: boolean;
  lastConnected?: string;
}

// Données de reçu à imprimer
export interface ReceiptData {
  // En-tête
  merchantName: string;
  merchantPhone?: string;
  marketName?: string;
  
  // Transaction
  transactionRef: string;
  date: string;
  time: string;
  
  // Articles (optionnel)
  items?: ReceiptItem[];
  
  // Totaux
  subtotal?: number;
  cmuDeduction?: number;
  rstiDeduction?: number;
  total: number;
  
  // Paiement
  paymentMethod: 'cash' | 'mobile_money' | 'wallet';
  
  // QR Code (optionnel)
  qrCodeData?: string;
  
  // Pied de page
  footerMessage?: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Job d'impression pour la queue
export interface PrintJob {
  id: string;
  receiptData: ReceiptData;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

// Événements imprimante
export type PrinterEventType = 
  | 'connected'
  | 'disconnected'
  | 'printing'
  | 'printed'
  | 'error'
  | 'queue_updated';

export interface PrinterEvent {
  type: PrinterEventType;
  data?: unknown;
  timestamp: number;
}

// Callbacks pour les événements
export type PrinterEventCallback = (event: PrinterEvent) => void;

// Props composants
export interface PrinterConnectButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
}

export interface PrintReceiptButtonProps {
  receiptData: ReceiptData;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  onPrinted?: () => void;
  onError?: (error: string) => void;
}

// Constantes
export const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  chunkSize: 20,
  chunkDelay: 50,
  paperWidth: 32,
  encoding: 'utf-8',
};

// UUIDs Bluetooth standards pour imprimantes thermiques
export const PRINTER_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
export const PRINTER_CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

// Liste imprimantes compatibles validées
export const COMPATIBLE_PRINTERS = [
  { name: 'Goojprt PT-210', tested: true },
  { name: 'MUNBYN IMP001', tested: true },
  { name: 'Rongta RPP02N', tested: false },
  { name: 'Zjiang ZJ-5802', tested: false },
] as const;
