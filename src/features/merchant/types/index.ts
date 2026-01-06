/**
 * Barrel export - Merchant Types
 */

// Credits
export type {
  CustomerCredit,
  CreditFilter,
  NewCreditInput,
  PaymentInput,
} from './credits.types';
export { newCreditSchema, paymentSchema, isCreditOverdue } from './credits.types';

// Daily Session
export type {
  OpenSessionInput,
  CloseSessionInput,
  DailySession,
  SessionStatus,
  SessionSummary,
} from './dailySession.types';
export { OpenSessionSchema, CloseSessionSchema } from './dailySession.types';

// Invoices
export type {
  Invoice,
  InvoiceFilter,
  MerchantInvoiceData,
  NewInvoiceInput,
  CancelInvoiceInput,
} from './invoices.types';
export {
  newInvoiceSchema,
  cancelInvoiceSchema,
  isInvoiceCancelled,
  formatInvoiceAmount,
  parseInvoiceAmount,
} from './invoices.types';

// Profile
export type { MerchantProfileData, ProfileEditInput } from './profile.types';
export { profileEditSchema } from './profile.types';

// Promotions
export type {
  Promotion,
  PromotionFilter,
  NewPromotionInput,
} from './promotions.types';
export {
  newPromotionSchema,
  isPromotionExpired,
  isPromotionUpcoming,
  getPromotionStatus,
} from './promotions.types';

// Stock
export type {
  Product,
  StockItem,
  ProductCategory,
  StockStatus,
  AddStockInput,
  UpdateStockInput,
} from './stock.types';
export { getStockStatus } from './stock.types';

// Suppliers
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
} from './suppliers.types';
export { STATUS_CONFIG } from './suppliers.types';

// Transactions
export type {
  CreateTransactionInput,
  SelectedProduct,
  StockItemForSelector,
  PaymentMethod,
  CashierStep,
  TransactionDetails,
} from './transaction.types';
export {
  CreateTransactionSchema,
  SelectedProductSchema,
  StockItemSchema,
} from './transaction.types';
