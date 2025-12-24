// === Hooks ===
export { useAgentRequest } from "./hooks/useAgentRequest";
export { useEnrollmentForm } from "./hooks/useEnrollmentForm";
export { useAgentDashboard } from "./hooks/useAgentDashboard";

// === Services ===
export { agentService } from "./services/agentService";
export { enrollmentService } from "./services/enrollmentService";

// === Types ===
export type {
  AgentRequest,
  AgentRequestInput,
  AgentProfile,
  AgentDashboardStats,
  AgentDashboardData,
} from "./types/agent.types";

export type {
  EnrollmentData,
  EnrollmentStep,
} from "./types/enrollment.types";

export {
  AgentRequestSchema,
  AgentRequestInputSchema,
} from "./types/agent.types";

export {
  EnrollmentStep1Schema,
  EnrollmentStep2Schema,
  EnrollmentStep3Schema,
  initialEnrollmentData,
  ENROLLMENT_DRAFT_KEY,
  ENROLLMENT_STEPS,
} from "./types/enrollment.types";

// === Components ===
export * from "./components/dashboard";
