import { useState, useEffect, useMemo } from 'react';
import { usersService, UsersRawData } from '../services/usersService';
import type {
  AdminUserData,
  UserFilters,
  AppRole,
  ExpectedEntityType
} from '../types/users.types';
import { adminLogger } from '@/infra/logger';

const getExpectedEntityType = (phone: string | null, roles: AppRole[]): ExpectedEntityType => {
  if (roles.includes('agent')) return 'agent';
  if (roles.includes('merchant')) return 'merchant';
  if (roles.includes('cooperative')) return 'cooperative';
  if (phone && phone.startsWith('07')) return 'agent';
  return 'unknown';
};

export const useAdminUsersData = () => {
  const [rawData, setRawData] = useState<UsersRawData>({
    profiles: [],
    roles: [],
    merchants: [],
    agents: [],
    cooperatives: [],
  });
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
      const data = await usersService.getAllUsers();
      setRawData(data);
    } catch (err) {
      adminLogger.error('Error fetching admin users data', err);
      setError(err instanceof Error ? err : new Error('Erreur de chargement'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const users: AdminUserData[] = useMemo(() => {
    return rawData.profiles.map(profile => {
      const userRoles = rawData.roles
        .filter(r => r.user_id === profile.user_id)
        .map(r => r.role as AppRole);
      
      const linkedMerchant = rawData.merchants.find(m => m.user_id === profile.user_id) || null;
      const linkedAgent = rawData.agents.find(a => a.user_id === profile.user_id) || null;
      const linkedCooperative = rawData.cooperatives.find(c => c.user_id === profile.user_id) || null;
      
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
  }, [rawData]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
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

      if (filters.roleFilter !== 'all') {
        if (!user.roles.includes(filters.roleFilter)) {
          return false;
        }
      }

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
