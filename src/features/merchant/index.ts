// ============================================
// Public API - Feature Merchant
// ============================================

// Hooks publics
export { useCashierPayment } from "./hooks/useCashierPayment";
export { useMerchantStock } from "./hooks/useMerchantStock";
export { useScannedProducts } from "./hooks/useScannedProducts";
export { useMerchantSuppliers } from "./hooks/useMerchantSuppliers";
export { useSupplierCart } from "./hooks/useSupplierCart";

// Services
export { transactionService } from "./services/transactionService";
export { stockService } from "./services/stockService";
export { suppliersService } from "./services/suppliersService";

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

// Types Suppliers
export type {
  CartItem,
  SupplierOrder,
  OrderStatus,
  Category,
  CategoryWithCount,
  Cooperative,
  UserLocation,
  SubmitOrderInput,
  SuppliersState,
} from "./types/suppliers.types";
export { STATUS_CONFIG } from "./types/suppliers.types";

// Composants Cashier
export {
  CashierInputStep,
  CashierConfirmStep,
  CashierSuccessStep,
} from "./components/cashier";

// Composants Suppliers
export {
  SuppliersCatalogue,
  SuppliersOrdersList,
  SuppliersCart,
  OrderConfirmDialog,
} from "./components/suppliers";

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
