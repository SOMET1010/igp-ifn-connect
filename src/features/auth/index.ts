// Components
export { GenericOtpLoginPage } from "./components/GenericOtpLoginPage";
export { AdminLoginPage } from "./components/AdminLoginPage";

// Configs
export {
  merchantLoginConfig,
  agentLoginConfig,
  cooperativeLoginConfig,
  adminLoginConfig,
} from "./config/loginConfigs";

// Types
export type {
  LoginStep,
  LoginRole,
  LoginRoleConfig,
  AdminLoginConfig,
  StepConfig,
} from "./types/login.types";
