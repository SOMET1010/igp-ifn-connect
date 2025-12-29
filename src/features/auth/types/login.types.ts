import { LucideIcon } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

export type LoginStep = "phone" | "otp" | "register";
export type LoginRole = "merchant" | "agent" | "cooperative" | "admin";

// Types for RPC function names
type RpcFunctionNames = keyof Database["public"]["Functions"];

// Types for table names
type TableNames = keyof Database["public"]["Tables"];

export interface StepConfig {
  title: string;
  subtitle: string;
}

export interface LoginRoleConfig {
  role: LoginRole;
  // Routes
  redirectTo: string;
  // Theming
  headerSubtitle: string;
  backgroundIcon: LucideIcon;
  // Steps config
  stepsConfig: Record<LoginStep, StepConfig>;
  // Labels
  registerFieldLabel: string;
  registerFieldPlaceholder: string;
  registerButtonLabel: string;
  successMessage: string;
  // Audio texts
  audioTexts: Record<LoginStep, string>;
  // Email/password pattern
  emailPattern: (phone: string) => string;
  passwordPattern: (phone: string) => string;
  // Role RPC function name - typed to valid RPC names
  roleRpcName: RpcFunctionNames;
  // Table name for entity creation - typed to valid table names
  tableName: TableNames;
  // Function to create entity row data
  createEntityData: (userId: string, phone: string, fullName: string) => Record<string, unknown>;
  // Function to update existing entity
  updateEntityOnLogin?: (userId: string, phone: string) => Promise<void>;
}

export interface AdminLoginConfig {
  role: "admin";
  redirectTo: string;
  headerTitle: string;
  headerSubtitle: string;
  backgroundIcon: LucideIcon;
  audioText: string;
}
