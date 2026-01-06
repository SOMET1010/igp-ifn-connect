// === PAGES (Architecture Vertical Slices) ===
export { default as AgentDashboard } from "./pages/AgentDashboard";
export { default as AgentLogin } from "./pages/AgentLogin";
export { default as AgentProfilePage } from "./pages/AgentProfile";
export { default as EnrollmentWizard } from "./pages/EnrollmentWizard";
export { default as MerchantList } from "./pages/MerchantList";

// === Hooks ===
export { useAgentRequest } from "./hooks/useAgentRequest";
export { useEnrollmentForm } from "./hooks/useEnrollmentForm";
export { useAgentDashboard } from "./hooks/useAgentDashboard";
export { useAgentProfile } from "./hooks/useAgentProfile";

// === Services ===
export { agentService } from "./services/agentService";
export { enrollmentService } from "./services/enrollmentService";
export { agentProfileService } from "./services/profileService";

// === Types ===
export type {
  AgentRequest,
  AgentRequestInput,
  AgentProfile,
  AgentDashboardStats,
  AgentDashboardData,
  DailyEnrollment,
} from "./types/agent.types";

export type {
  EnrollmentData,
  EnrollmentStep,
  IdDocType,
} from "./types/enrollment.types";

export type {
  AgentProfileData,
  AgentProfileEditInput,
} from "./types/profile.types";

export {
  AgentRequestSchema,
  AgentRequestInputSchema,
} from "./types/agent.types";

export {
  EnrollmentStep1Schema,
  EnrollmentStep2Schema,
  EnrollmentStep3Schema,
  EnrollmentStep4Schema,
  initialEnrollmentData,
  ENROLLMENT_DRAFT_KEY,
  ENROLLMENT_STEPS,
  ID_DOC_TYPES,
} from "./types/enrollment.types";

export { agentProfileEditSchema } from "./types/profile.types";

// === Components ===
export * from "./components/dashboard";
export * from "./components/profile";
