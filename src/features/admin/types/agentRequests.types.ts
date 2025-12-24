export interface AgentRequest {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  organization: string;
  preferred_zone: string | null;
  motivation: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentRequestsFilters {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  search: string;
}

export interface AgentRequestsStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
