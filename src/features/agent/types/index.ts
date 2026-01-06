/**
 * Barrel export - Agent Types
 */

// Agent core types
export type {
  AgentRequest,
  AgentRequestInput,
  AgentProfile,
  DailyEnrollment,
  AgentDashboardStats,
  AgentDashboardData,
} from './agent.types';
export { AgentRequestSchema, AgentRequestInputSchema } from './agent.types';

// Enrollment types
export type {
  IdDocType,
  EnrollmentData,
  EnrollmentStep,
} from './enrollment.types';
export {
  initialEnrollmentData,
  EnrollmentStep1Schema,
  EnrollmentStep2Schema,
  EnrollmentStep3Schema,
  EnrollmentStep4Schema,
  ENROLLMENT_DRAFT_KEY,
  ENROLLMENT_STEPS,
  ID_DOC_TYPES,
} from './enrollment.types';

// Profile types
export type { AgentProfileData, AgentProfileEditInput } from './profile.types';
export { agentProfileEditSchema } from './profile.types';
