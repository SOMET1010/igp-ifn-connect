// ============================================
// Public API - Feature Merchant
// ============================================

// Hooks publics
export { useCashierPayment } from "./hooks/useCashierPayment";
export { useMerchantStock } from "./hooks/useMerchantStock";
export { useScannedProducts } from "./hooks/useScannedProducts";
export { useMerchantSuppliers } from "./hooks/useMerchantSuppliers";
export { useSupplierCart } from "./hooks/useSupplierCart";
export { useMerchantCredits } from "./hooks/useMerchantCredits";
export { useTransactions } from "./hooks/useTransactions";

// Services
export { transactionService } from "./services/transactionService";
export { stockService } from "./services/stockService";
export { suppliersService } from "./services/suppliersService";
export { creditsService } from "./services/creditsService";
export { profileService } from "./services/profileService";

// Hooks
export { useMerchantProfile } from "./hooks/useMerchantProfile";

// Types Profile
export type { MerchantProfileData, ProfileEditInput } from "./types/profile.types";
export { profileEditSchema } from "./types/profile.types";

// Composants Profile
export { ProfileHeader, ProfileEditForm } from "./components/profile";

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
  OrderSuccessScreen,
} from "./components/suppliers";

// Composants Credits
export {
  CreditsSummary,
  CreditsFilters,
  CreditCard,
  CreditsList,
  AddCreditDialog,
  PaymentDialog,
} from "./components/credits";

// Types Credits
export type {
  CustomerCredit,
  CreditFilter,
  NewCreditInput,
  PaymentInput,
} from "./types/credits.types";
export { newCreditSchema, paymentSchema, isCreditOverdue } from "./types/credits.types";

// Types publics
export type {
  CreateTransactionInput,
  SelectedProduct,
  StockItemForSelector,
  PaymentMethod,
  CashierStep,
  TransactionDetails,
} from "./types/transaction.types";

// Utilitaires Cashier
export {
  calculateCmuDeduction,
  calculateRstiDeduction,
  calculateProductsTotal,
  formatCurrency,
  generateTransactionReference,
  parseManualAmount,
} from "./utils/cashierCalculations";

// Utilitaires Transactions
export {
  groupTransactionsByDate,
  getDateRangeForPeriod,
  filterTransactionsByPeriod,
  calculateTransactionsSummary,
  formatTransactionForExport,
} from "./utils/transactionUtils";
export type {
  TransactionListItem,
  GroupedTransactions,
  ExportPeriod,
  TransactionsSummary,
  DateRange,
} from "./utils/transactionUtils";

// Promotions
export { usePromotions } from "./hooks/usePromotions";
export { promotionsService } from "./services/promotionsService";
export type {
  Promotion,
  PromotionFilter,
  NewPromotionInput,
} from "./types/promotions.types";
export {
  newPromotionSchema,
  isPromotionExpired,
  isPromotionUpcoming,
  getPromotionStatus,
} from "./types/promotions.types";
export {
  PromotionCard,
  AddPromotionDialog,
  DeletePromotionDialog,
  PromotionsSummary,
  PromotionsFilters,
} from "./components/promotions";
