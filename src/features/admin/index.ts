// === PAGES (Architecture Vertical Slices) ===
export { default as AdminDashboard } from "./pages/AdminDashboard";
export { default as AdminLogin } from "./pages/AdminLogin";
export { default as AdminMerchants } from "./pages/AdminMerchants";
export { default as AdminAgents } from "./pages/AdminAgents";
export { default as AdminAgentRequests } from "./pages/AdminAgentRequests";
export { default as AdminCooperatives } from "./pages/AdminCooperatives";
export { default as AdminProducers } from "./pages/AdminProducers";
export { default as AdminMap } from "./pages/AdminMap";
export { default as AdminMonitoring } from "./pages/AdminMonitoring";
export { default as AdminAnalytics } from "./pages/AdminAnalytics";
export { default as AdminReports } from "./pages/AdminReports";
export { default as AdminStudio } from "./pages/AdminStudio";
export { default as AdminVivriers } from "./pages/AdminVivriers";
export { default as AdminUsers } from "./pages/AdminUsers";
export { default as AdminUserDetail } from "./pages/AdminUserDetail";
export { default as AdminKycReview } from "./pages/AdminKycReview";
export { default as AdminDiagnostics } from "./pages/AdminDiagnostics";
export { default as AdminCardsImport } from "./pages/AdminCardsImport";
export { default as AdminCardsSearch } from "./pages/AdminCardsSearch";

// Hooks publics
export { useAdminDashboard } from './hooks/useAdminDashboard';
export { useAdminAgentRequests } from './hooks/useAdminAgentRequests';
export { useAdminUsersData } from './hooks/useAdminUsersData';
export { useAdminUserDetail } from './hooks/useAdminUserDetail';
export { useAdminMapData } from './hooks/useAdminMapData';

// Services
export { dashboardService } from './services/dashboardService';
export { agentRequestsService } from './services/agentRequestsService';
export { usersService } from './services/usersService';
export { mapService } from './services/mapService';
export * from './services/cardsImportService';

// Components Dashboard
export * from './components/dashboard';

// Components UI Admin
export { ActivityTimeline } from './components/ActivityTimeline';
export { DashboardSkeleton } from './components/DashboardSkeleton';
export { TestNotificationButton } from './components/TestNotificationButton';
export * from './components/map';

// Types - Dashboard
export type { AdminDashboardStats, ChartDataPoint, AdminDashboardData } from './types/dashboard.types';

// Types - Agent Requests
export type { AgentRequest, AgentRequestsFilters, AgentRequestsStats } from './types/agentRequests.types';

// Types - Users
export type {
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
  UserDetailCooperative
} from './types/users.types';

// Types - Map
export type { MapEntity, MapFilters } from './types/map.types';
