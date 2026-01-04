/**
 * Feature Sales - P.NA.VIM
 * Module de vente avec support offline et vocal
 */

// Components
export { QuickSaleScreen } from './components/QuickSaleScreen';

// Hooks
export { useQuickSale } from './hooks/useQuickSale';

// Services
export { 
  createQuickSale,
  parseVoiceCommand,
  generateConfirmationText,
  generateSuccessText
} from './services/saleService';

// Types
export type {
  QuickSale,
  QuickSaleInput,
  QuickSaleStep,
  QuickSaleState,
  SaleItem,
  VoiceCommand,
} from './types/sale.types';
