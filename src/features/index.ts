/**
 * Point d'entrée centralisé de tous les modules features
 *
 * Usage:
 *   import { useCooperativeStock, agentService } from "@/features";
 *   import type { Cooperative, MerchantStockItem } from "@/features";
 *
 * Note: Les exports en conflit sont préfixés par le nom du module:
 *   - merchantStockService / cooperativeStockService
 *   - MerchantStockStatus / CooperativeStockStatus
 *   - AgentAgentRequest / AdminAgentRequest
 */

// ============================================
// Module Merchant (exports renommés pour éviter conflits)
// ============================================
export {
  useCashierPayment,
  useMerchantStock,
  transactionService,
  stockService as merchantStockService,
  getStockStatus as getMerchantStockStatus,
  CashierInputStep,
  CashierConfirmStep,
  CashierSuccessStep,
  calculateCmuDeduction,
  calculateRstiDeduction,
  calculateProductsTotal,
  formatCurrency,
  generateTransactionReference,
  parseManualAmount,
} from "./merchant";

export type {
  StockItem as MerchantStockItem,
  Product as MerchantProduct,
  ProductCategory,
  StockStatus as MerchantStockStatus,
  AddStockInput as MerchantAddStockInput,
  UpdateStockInput,
  CreateTransactionInput,
  SelectedProduct,
  StockItemForSelector,
  PaymentMethod,
  CashierStep,
  TransactionDetails,
} from "./merchant";

// ============================================
// Module Cooperative (exports renommés pour éviter conflits)
// ============================================
export {
  useCooperativeStock,
  useCooperativeOrders,
  useCooperativeNotifications,
  useCooperativeDashboard,
  cooperativeService,
  stockService as cooperativeStockService,
  orderService,
  CooperativeSchema,
  LOW_STOCK_THRESHOLD,
  EXPIRY_WARNING_DAYS,
  AddStockInputSchema,
  getStockStatus as getCooperativeStockStatus,
  countLowStockItems,
  countOutOfStockItems,
  countExpiringItems,
  filterOrdersByStatus,
  formatCooperativeLocation,
  statusLabels,
  CooperativeStats,
  PendingOrdersAlert,
  QuickGuide,
} from "./cooperative";

export type {
  CooperativeNotifications,
  Cooperative,
  CooperativeData,
  DashboardStats as CooperativeDashboardStats,
  DashboardData as CooperativeDashboardData,
  CooperativeStockItem,
  CooperativeProduct,
  StockStatus as CooperativeStockStatus,
  AddStockInput as CooperativeAddStockInput,
  Order,
  OrderStatus,
} from "./cooperative";

// ============================================
// Module Agent (exports renommés pour éviter conflits)
// ============================================
export {
  useAgentRequest,
  useEnrollmentForm,
  useAgentDashboard,
  agentService,
  enrollmentService,
  AgentRequestSchema,
  AgentRequestInputSchema,
  EnrollmentStep1Schema,
  EnrollmentStep2Schema,
  EnrollmentStep3Schema,
  initialEnrollmentData,
  ENROLLMENT_DRAFT_KEY,
  ENROLLMENT_STEPS,
  AgentQuickGuide,
  AgentRegistrationSection,
  AgentStats,
  PendingSyncAlert,
} from "./agent";

export type {
  AgentRequest as AgentAgentRequest,
  AgentRequestInput,
  AgentProfile,
  AgentDashboardStats,
  AgentDashboardData,
  EnrollmentData,
  EnrollmentStep,
} from "./agent";

// ============================================
// Module Admin
// ============================================
export {
  useAdminDashboard,
  useAdminAgentRequests,
  useAdminUsersData,
  useAdminUserDetail,
  useAdminMapData,
  dashboardService,
  // Components
  AdminStats,
  EnrollmentChart,
  NavigationCards,
  AdvancedToolsGrid,
  agentRequestsService,
  usersService,
  mapService,
} from "./admin";

export type {
  AdminDashboardStats,
  ChartDataPoint,
  AdminDashboardData,
  AgentRequest as AdminAgentRequest,
  AgentRequestsFilters,
  AgentRequestsStats,
  AppRole,
  UserProfile,
  UserRole,
  LinkedMerchant,
  LinkedAgent,
  LinkedCooperative,
  ExpectedEntityType,
  AdminUserData,
  UserFilters,
  UserActivity,
  UserDetailData,
  UserDetailProfile,
  UserDetailAgent,
  UserDetailMerchant,
  UserDetailCooperative,
  MapEntity,
  MapFilters,
} from "./admin";
