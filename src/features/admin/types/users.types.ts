import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
}

export interface UserRole {
  user_id: string;
  role: AppRole;
}

export interface LinkedMerchant {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  status: string | null;
}

export interface LinkedAgent {
  id: string;
  user_id: string;
  employee_id: string;
  organization: string;
  is_active: boolean | null;
}

export interface LinkedCooperative {
  id: string;
  user_id: string;
  name: string;
  code: string;
  region: string;
}

export type ExpectedEntityType = 'merchant' | 'agent' | 'cooperative' | 'unknown';

export interface AdminUserData {
  userId: string;
  fullName: string;
  phone: string | null;
  createdAt: string;
  roles: AppRole[];
  linkedMerchant: LinkedMerchant | null;
  linkedAgent: LinkedAgent | null;
  linkedCooperative: LinkedCooperative | null;
  hasLinkedEntity: boolean;
  expectedEntityType: ExpectedEntityType;
}

export interface UserFilters {
  search: string;
  roleFilter: 'all' | AppRole;
  linkedFilter: 'all' | 'linked' | 'orphan';
}

export interface UserActivity {
  id: string;
  type: 'account_created' | 'role_assigned' | 'entity_created' | 
        'entity_validated' | 'transaction' | 'invoice' | 'profile_updated' | 'enrollment';
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  icon: string;
  color: string;
}

export interface UserDetailProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetailAgent {
  id: string;
  employeeId: string;
  organization: string;
  zone: string | null;
  isActive: boolean;
  totalEnrollments: number;
  createdAt: string;
}

export interface UserDetailMerchant {
  id: string;
  fullName: string;
  phone: string;
  cmuNumber: string;
  activityType: string;
  status: string;
  enrolledAt: string;
  validatedAt: string | null;
  marketName?: string;
}

export interface UserDetailCooperative {
  id: string;
  name: string;
  code: string;
  region: string;
  commune: string;
  totalMembers: number;
  createdAt: string;
}

export interface UserDetailData {
  profile: UserDetailProfile | null;
  roles: AppRole[];
  linkedAgent: UserDetailAgent | null;
  linkedMerchant: UserDetailMerchant | null;
  linkedCooperative: UserDetailCooperative | null;
  activities: UserActivity[];
  stats: {
    totalTransactions: number;
    totalAmount: number;
    enrollmentsCount: number;
    invoicesCount: number;
  };
}
