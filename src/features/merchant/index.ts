// ============================================
// Public API - Feature Merchant
// ============================================

// Hooks publics
export { useCashierPayment } from "./hooks/useCashierPayment";

// Services
export { transactionService } from "./services/transactionService";

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
