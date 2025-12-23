import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: AppRole;
}

interface LinkedMerchant {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  status: string | null;
}

interface LinkedAgent {
  id: string;
  user_id: string;
  employee_id: string;
  organization: string;
  is_active: boolean | null;
}

interface LinkedCooperative {
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

// Detect expected entity type based on phone pattern in profile
const getExpectedEntityType = (phone: string | null, roles: AppRole[]): ExpectedEntityType => {
  // If user has agent role but no linked agent, they should be an agent
  if (roles.includes('agent')) return 'agent';
  // If user has merchant role but no linked merchant, they should be a merchant
  if (roles.includes('merchant')) return 'merchant';
  // If user has cooperative role but no linked cooperative
  if (roles.includes('cooperative')) return 'cooperative';
  // Check phone pattern - starts with 07 often indicates agent
  if (phone && phone.startsWith('07')) return 'agent';
  return 'unknown';
};

export interface UserFilters {
  search: string;
  roleFilter: 'all' | AppRole;
  linkedFilter: 'all' | 'linked' | 'orphan';
}

export const useAdminUsersData = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [merchants, setMerchants] = useState<LinkedMerchant[]>([]);
  const [agents, setAgents] = useState<LinkedAgent[]>([]);
  const [cooperatives, setCooperatives] = useState<LinkedCooperative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    roleFilter: 'all',
    linkedFilter: 'all',
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [profilesRes, rolesRes, merchantsRes, agentsRes, cooperativesRes] = await Promise.all([
        supabase.from('profiles').select('id, user_id, full_name, phone, created_at'),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('merchants').select('id, user_id, full_name, phone, status').not('user_id', 'is', null),
        supabase.from('agents').select('id, user_id, employee_id, organization, is_active').not('user_id', 'is', null),
        supabase.from('cooperatives').select('id, user_id, name, code, region').not('user_id', 'is', null),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;
      if (merchantsRes.error) throw merchantsRes.error;
      if (agentsRes.error) throw agentsRes.error;
      if (cooperativesRes.error) throw cooperativesRes.error;

      setProfiles(profilesRes.data || []);
      setRoles(rolesRes.data || []);
      setMerchants((merchantsRes.data || []) as LinkedMerchant[]);
      setAgents((agentsRes.data || []) as LinkedAgent[]);
      setCooperatives((cooperativesRes.data || []) as LinkedCooperative[]);
    } catch (err) {
      console.error('Error fetching admin users data:', err);
      setError(err instanceof Error ? err : new Error('Erreur de chargement'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const users: AdminUserData[] = useMemo(() => {
    return profiles.map(profile => {
      const userRoles = roles
        .filter(r => r.user_id === profile.user_id)
        .map(r => r.role);
      
      const linkedMerchant = merchants.find(m => m.user_id === profile.user_id) || null;
      const linkedAgent = agents.find(a => a.user_id === profile.user_id) || null;
      const linkedCooperative = cooperatives.find(c => c.user_id === profile.user_id) || null;
      
      const hasLinkedEntity = !!(linkedMerchant || linkedAgent || linkedCooperative);
      const rolesArray = userRoles.length > 0 ? userRoles : ['user' as AppRole];
      
      return {
        userId: profile.user_id,
        fullName: profile.full_name,
        phone: profile.phone,
        createdAt: profile.created_at,
        roles: rolesArray,
        linkedMerchant,
        linkedAgent,
        linkedCooperative,
        hasLinkedEntity,
        expectedEntityType: hasLinkedEntity ? 'unknown' : getExpectedEntityType(profile.phone, rolesArray),
      };
    });
  }, [profiles, roles, merchants, agents, cooperatives]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = user.fullName.toLowerCase().includes(searchLower);
        const matchesPhone = user.phone?.includes(filters.search);
        const matchesMerchant = user.linkedMerchant?.full_name.toLowerCase().includes(searchLower);
        const matchesAgent = user.linkedAgent?.employee_id.toLowerCase().includes(searchLower);
        const matchesCoop = user.linkedCooperative?.name.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesPhone && !matchesMerchant && !matchesAgent && !matchesCoop) {
          return false;
        }
      }

      // Role filter
      if (filters.roleFilter !== 'all') {
        if (!user.roles.includes(filters.roleFilter)) {
          return false;
        }
      }

      // Linked filter
      if (filters.linkedFilter === 'linked' && !user.hasLinkedEntity) {
        return false;
      }
      if (filters.linkedFilter === 'orphan' && user.hasLinkedEntity) {
        return false;
      }

      return true;
    });
  }, [users, filters]);

  const stats = useMemo(() => ({
    total: users.length,
    linked: users.filter(u => u.hasLinkedEntity).length,
    orphan: users.filter(u => !u.hasLinkedEntity).length,
    admins: users.filter(u => u.roles.includes('admin')).length,
    merchants: users.filter(u => u.roles.includes('merchant')).length,
    agents: users.filter(u => u.roles.includes('agent')).length,
    cooperatives: users.filter(u => u.roles.includes('cooperative')).length,
  }), [users]);

  return {
    users: filteredUsers,
    stats,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchData,
  };
};
