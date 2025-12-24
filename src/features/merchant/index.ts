// ============================================
// Public API - Feature Merchant
// ============================================

// Hooks publics
export { useCashierPayment } from "./hooks/useCashierPayment";
export { useMerchantStock } from "./hooks/useMerchantStock";
export { useScannedProducts } from "./hooks/useScannedProducts";

// Services
export { transactionService } from "./services/transactionService";
export { stockService } from "./services/stockService";

// Types Stock
export type {
  StockItem,
  Product,
  ProductCategory,
  StockStatus,
  AddStockInput,
  UpdateStockInput,
} from "./types/stock.types";
export { getStockStatus } from "./types/stock.types";

// Composants Cashier
export {
  CashierInputStep,
  CashierConfirmStep,
  CashierSuccessStep,
} from "./components/cashier";

// Types publics
export type {
  CreateTransactionInput,
  SelectedProduct,
  StockItemForSelector,
  PaymentMethod,
  CashierStep,
  TransactionDetails,
} from "./types/transaction.types";

// Utilitaires
export {
  calculateCmuDeduction,
  calculateRstiDeduction,
  calculateProductsTotal,
  formatCurrency,
  generateTransactionReference,
  parseManualAmount,
} from "./utils/cashierCalculations";
