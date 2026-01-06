/**
 * Point d'entrée public du module Cooperative
 * Seules les API exposées ici sont considérées publiques
 */

// === PAGES (Architecture Vertical Slices) ===
export { default as CooperativeDashboard } from "./pages/CooperativeDashboard";
export { default as CooperativeLogin } from "./pages/CooperativeLogin";
export { default as CooperativeRegister } from "./pages/CooperativeRegister";
export { default as CooperativeStock } from "./pages/CooperativeStock";
export { default as CooperativeOrders } from "./pages/CooperativeOrders";
export { default as CooperativeProfilePage } from "./pages/CooperativeProfile";
export { default as CooperativeMembers } from "./pages/CooperativeMembers";
export { default as CooperativeProducers } from "./pages/CooperativeProducers";
export { default as CooperativeProducerOrders } from "./pages/CooperativeProducerOrders";
export { useCooperativeStock } from "./hooks/useCooperativeStock";
export { useCooperativeOrders } from "./hooks/useCooperativeOrders";
export { useCooperativeNotifications } from "./hooks/useCooperativeNotifications";
export type { CooperativeNotifications } from "./hooks/useCooperativeNotifications";
export { useCooperativeDashboard } from "./hooks/useCooperativeDashboard";
export { useCooperativeProfile } from "./hooks/useCooperativeProfile";

// Services
export { cooperativeService } from "./services/cooperativeService";
export { stockService } from "./services/stockService";
export { orderService } from "./services/orderService";
export * as profileService from "./services/profileService";

// Types Cooperative
export type { Cooperative, CooperativeData, DashboardStats, DashboardData } from "./types/cooperative.types";
export { CooperativeSchema } from "./types/cooperative.types";

// Types DateFilter
export type { DateFilterValue, DateFilterOption } from "./types/dateFilter.types";
export { DATE_FILTER_OPTIONS, getDateRangeForFilter } from "./types/dateFilter.types";

// Types Stock
export type { CooperativeStockItem, CooperativeProduct, StockStatus, AddStockInput } from "./types/stock.types";
export { getStockStatus, LOW_STOCK_THRESHOLD, EXPIRY_WARNING_DAYS, AddStockInputSchema } from "./types/stock.types";

// Types Order
export type { Order, OrderStatus } from "./types/order.types";
export { statusLabels } from "./types/order.types";

// Types Profile
export type { CooperativeProfileData, CooperativeProfileFormData } from "./types/profile.types";
export { cooperativeProfileSchema, REGIONS_CI } from "./types/profile.types";

// Utils
export { 
  countLowStockItems, 
  countOutOfStockItems, 
  countExpiringItems,
  filterOrdersByStatus,
  formatCooperativeLocation 
} from "./utils/cooperativeCalculations";

// Composants Dashboard
export { 
  CooperativeStats, 
  CooperativeOrdersChart,
  CooperativeRevenueChart,
  CooperativeAlerts, 
  PendingOrdersAlert, 
  QuickGuide,
  DateFilterTabs,
} from "./components/dashboard";

// Composants Profile
export { 
  CooperativeProfileHeader, 
  CooperativeProfileView, 
  CooperativeProfileEditForm 
} from "./components/profile";
