/**
 * Point d'entrée public du module Printer
 * Impression Bluetooth ESC/POS pour reçus thermiques
 */

// Types
export type {
  PrinterConnectionStatus,
  PrinterConfig,
  PrinterDevice,
  ReceiptData,
  ReceiptItem,
  PrintJob,
  PrinterEventType,
  PrinterEvent,
  PrinterConnectButtonProps,
  PrintReceiptButtonProps,
} from './types/printer.types';

export {
  DEFAULT_PRINTER_CONFIG,
  PRINTER_SERVICE_UUID,
  PRINTER_CHARACTERISTIC_UUID,
  COMPATIBLE_PRINTERS,
} from './types/printer.types';

// Services
export { ESCPOSEncoder } from './services/escposEncoder';
export { printerService } from './services/printerService';
export { printerQueue } from './services/printerQueue';

// Hooks
export { usePrinter } from './hooks/usePrinter';
export type { UsePrinterReturn } from './hooks/usePrinter';
export { usePrintReceipt } from './hooks/usePrintReceipt';
export type { UsePrintReceiptReturn } from './hooks/usePrintReceipt';

// Composants
export { PrinterConnectButton } from './components/PrinterConnectButton';
export { PrintReceiptButton } from './components/PrintReceiptButton';
export { PrinterStatus } from './components/PrinterStatus';
