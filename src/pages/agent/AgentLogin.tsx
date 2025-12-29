import { GenericOtpLoginPage, agentLoginConfig } from "@/features/auth";

const AgentLogin = () => {
  return <GenericOtpLoginPage config={agentLoginConfig} />;
};

export default AgentLogin;
