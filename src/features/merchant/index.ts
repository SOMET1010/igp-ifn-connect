// ============================================
// Public API - Feature Merchant
// ============================================

// === PAGES (Architecture Vertical Slices) ===
export { default as MerchantDashboard } from "./pages/MerchantDashboard";
export { default as MerchantSell } from "./pages/MerchantSell";
export { default as MerchantMoney } from "./pages/MerchantMoney";
export { default as MerchantProfile } from "./pages/MerchantProfile";
export { default as MerchantStock } from "./pages/MerchantStock";
export { default as MerchantCredits } from "./pages/MerchantCredits";
export { default as MerchantClose } from "./pages/MerchantClose";
export { default as MerchantKyc } from "./pages/MerchantKyc";
export { default as MerchantLogin } from "./pages/MerchantLogin";
export { default as MerchantVoiceEntry } from "./pages/MerchantVoiceEntry";
export { default as MerchantVoiceRegister } from "./pages/MerchantVoiceRegister";
export { default as MerchantSecurityFallback } from "./pages/MerchantSecurityFallback";
export { default as MerchantCashier } from "./pages/MerchantCashier";
export { default as MerchantScanner } from "./pages/MerchantScanner";
export { default as MerchantTransactions } from "./pages/MerchantTransactions";
export { default as MerchantInvoices } from "./pages/MerchantInvoices";
export { default as MerchantCMU } from "./pages/MerchantCMU";
export { default as MerchantHelp } from "./pages/MerchantHelp";
export { default as SalesQuick } from "./pages/SalesQuick";

// Hooks publics
export { useCashierPayment } from "./hooks/useCashierPayment";
export { useMerchantStock } from "./hooks/useMerchantStock";
export { useScannedProducts } from "./hooks/useScannedProducts";
export { useMerchantSuppliers } from "./hooks/useMerchantSuppliers";
export { useSupplierCart } from "./hooks/useSupplierCart";
export { useMerchantCredits } from "./hooks/useMerchantCredits";
export { useTransactions } from "./hooks/useTransactions";
export { useMerchantDashboardData } from "./hooks/useMerchantDashboardData";
export type { DailySales, MerchantDashboardData } from "./hooks/useMerchantDashboardData";
export { useMerchantNotifications } from "./hooks/useMerchantNotifications";
export { useMarketBackground } from "./hooks/useMarketBackground";

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

// Composants UI Merchant
export { AudioBars } from "./components/AudioBars";
export { CalculatorKeypad, useSuccessFeedback } from "./components/CalculatorKeypad";
export { CashDenominationPad } from "./components/CashDenominationPad";
export { ClassicModeCard } from "./components/ClassicModeCard";
export { DailyRevenue } from "./components/DailyRevenue";
export { FNEInvoice, type InvoiceData } from "./components/FNEInvoice";
export { MerchantDashboardSkeleton } from "./components/MerchantDashboardSkeleton";
export { ProductSelector } from "./components/ProductSelector";
export { QRReceipt } from "./components/QRReceipt";
export { SalesChart } from "./components/SalesChart";
export { VoiceModeCard } from "./components/VoiceModeCard";

// Composants Dashboard
export * from "./components/dashboard";

// Composants Stock
export * from "./components/stock";

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

// Invoices
export { useInvoices } from "./hooks/useInvoices";
export { invoicesService } from "./services/invoicesService";
export type {
  Invoice,
  InvoiceFilter,
  MerchantInvoiceData,
  NewInvoiceInput,
  CancelInvoiceInput,
} from "./types/invoices.types";
export {
  newInvoiceSchema,
  cancelInvoiceSchema,
  isInvoiceCancelled,
  formatInvoiceAmount,
  parseInvoiceAmount,
} from "./types/invoices.types";
export {
  InvoiceCard,
  CreateInvoiceDialog,
  CancelInvoiceDialog,
  InvoicesSummary,
  InvoicesFilters,
} from "./components/invoices";

// Utilitaires PDF & Factures
export { exportInvoiceToPDF, exportSalesReportToPDF } from "./utils/pdfExport";
export {
  generateSecurityHash,
  generateVerificationUrl,
  FISCAL_REGIME_LABELS,
} from "./utils/invoiceUtils";
