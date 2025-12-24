import { useState, useEffect, useMemo } from 'react';
import { usersService } from '../services/usersService';
import type {
  UserDetailData,
  UserDetailProfile,
  UserDetailAgent,
  UserDetailMerchant,
  UserDetailCooperative,
  UserActivity,
  AppRole
} from '../types/users.types';

interface RoleWithDate {
  role: AppRole;
  createdAt: string;
}

export const useAdminUserDetail = (userId: string | undefined) => {
  const [profile, setProfile] = useState<UserDetailProfile | null>(null);
  const [roles, setRoles] = useState<RoleWithDate[]>([]);
  const [linkedAgent, setLinkedAgent] = useState<UserDetailAgent | null>(null);
  const [linkedMerchant, setLinkedMerchant] = useState<UserDetailMerchant | null>(null);
  const [linkedCooperative, setLinkedCooperative] = useState<UserDetailCooperative | null>(null);
  const [transactions, setTransactions] = useState<{ id: string; amount: number; createdAt: string; reference: string | null; type: string }[]>([]);
  const [invoices, setInvoices] = useState<{ id: string; invoiceNumber: string; amountTtc: number; createdAt: string }[]>([]);
  const [enrolledMerchants, setEnrolledMerchants] = useState<{ id: string; fullName: string; enrolledAt: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch profile
      const profileData = await usersService.getUserProfile(userId);
      if (profileData) {
        setProfile({
          id: profileData.id,
          userId: profileData.user_id,
          fullName: profileData.full_name,
          phone: profileData.phone,
          avatarUrl: profileData.avatar_url,
          createdAt: profileData.created_at,
          updatedAt: profileData.updated_at,
        });
      }

      // Fetch roles
      const rolesData = await usersService.getUserRoles(userId);
      setRoles(rolesData);

      // Fetch linked agent
      const agentData = await usersService.getLinkedAgent(userId);
      if (agentData) {
        setLinkedAgent({
          id: agentData.id,
          employeeId: agentData.employee_id,
          organization: agentData.organization,
          zone: agentData.zone,
          isActive: agentData.is_active ?? true,
          totalEnrollments: agentData.total_enrollments ?? 0,
          createdAt: agentData.created_at,
        });

        const enrolled = await usersService.getEnrolledMerchants(agentData.id);
        setEnrolledMerchants(enrolled);
      }

      // Fetch linked merchant
      const merchantData = await usersService.getLinkedMerchant(userId);
      if (merchantData) {
        setLinkedMerchant({
          id: merchantData.id,
          fullName: merchantData.full_name,
          phone: merchantData.phone,
          cmuNumber: merchantData.cmu_number,
          activityType: merchantData.activity_type,
          status: merchantData.status ?? 'pending',
          enrolledAt: merchantData.enrolled_at,
          validatedAt: merchantData.validated_at,
          marketName: (merchantData.markets as { name: string } | null)?.name,
        });

        const txData = await usersService.getMerchantTransactions(merchantData.id);
        setTransactions(txData);

        const invData = await usersService.getMerchantInvoices(merchantData.id);
        setInvoices(invData);
      }

      // Fetch linked cooperative
      const coopData = await usersService.getLinkedCooperative(userId);
      if (coopData) {
        setLinkedCooperative({
          id: coopData.id,
          name: coopData.name,
          code: coopData.code,
          region: coopData.region,
          commune: coopData.commune,
          totalMembers: coopData.total_members ?? 0,
          createdAt: coopData.created_at,
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur de chargement'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const activities = useMemo<UserActivity[]>(() => {
    const items: UserActivity[] = [];

    if (profile) {
      items.push({
        id: `account-${profile.id}`,
        type: 'account_created',
        description: 'Compte créé',
        timestamp: profile.createdAt,
        icon: 'UserPlus',
        color: 'bg-blue-500',
      });

      if (profile.updatedAt !== profile.createdAt) {
        items.push({
          id: `profile-update-${profile.id}`,
          type: 'profile_updated',
          description: 'Profil mis à jour',
          timestamp: profile.updatedAt,
          icon: 'Edit',
          color: 'bg-gray-500',
        });
      }
    }

    roles.forEach(r => {
      items.push({
        id: `role-${r.role}-${r.createdAt}`,
        type: 'role_assigned',
        description: `Rôle "${r.role}" attribué`,
        timestamp: r.createdAt,
        icon: 'Shield',
        color: 'bg-purple-500',
      });
    });

    if (linkedAgent) {
      items.push({
        id: `agent-${linkedAgent.id}`,
        type: 'entity_created',
        description: `Agent créé (${linkedAgent.employeeId})`,
        timestamp: linkedAgent.createdAt,
        metadata: { organization: linkedAgent.organization, zone: linkedAgent.zone },
        icon: 'UserCog',
        color: 'bg-green-500',
      });
    }

    if (linkedMerchant) {
      items.push({
        id: `merchant-${linkedMerchant.id}`,
        type: 'entity_created',
        description: `Marchand créé`,
        timestamp: linkedMerchant.enrolledAt,
        metadata: { cmuNumber: linkedMerchant.cmuNumber, activityType: linkedMerchant.activityType },
        icon: 'Store',
        color: 'bg-orange-500',
      });

      if (linkedMerchant.validatedAt) {
        items.push({
          id: `merchant-validated-${linkedMerchant.id}`,
          type: 'entity_validated',
          description: 'Marchand validé',
          timestamp: linkedMerchant.validatedAt,
          icon: 'CheckCircle',
          color: 'bg-green-600',
        });
      }
    }

    if (linkedCooperative) {
      items.push({
        id: `coop-${linkedCooperative.id}`,
        type: 'entity_created',
        description: `Coopérative créée (${linkedCooperative.code})`,
        timestamp: linkedCooperative.createdAt,
        metadata: { region: linkedCooperative.region, commune: linkedCooperative.commune },
        icon: 'Building2',
        color: 'bg-teal-500',
      });
    }

    enrolledMerchants.forEach(m => {
      items.push({
        id: `enrollment-${m.id}`,
        type: 'enrollment',
        description: `Marchand enrôlé : ${m.fullName}`,
        timestamp: m.enrolledAt,
        icon: 'UserCheck',
        color: 'bg-emerald-500',
      });
    });

    transactions.forEach(t => {
      items.push({
        id: `tx-${t.id}`,
        type: 'transaction',
        description: `Transaction ${t.type}: ${t.amount.toLocaleString('fr-FR')} FCFA`,
        timestamp: t.createdAt,
        metadata: { reference: t.reference, amount: t.amount },
        icon: 'Banknote',
        color: 'bg-yellow-500',
      });
    });

    invoices.forEach(i => {
      items.push({
        id: `invoice-${i.id}`,
        type: 'invoice',
        description: `Facture ${i.invoiceNumber}: ${i.amountTtc.toLocaleString('fr-FR')} FCFA`,
        timestamp: i.createdAt,
        metadata: { invoiceNumber: i.invoiceNumber, amount: i.amountTtc },
        icon: 'FileText',
        color: 'bg-indigo-500',
      });
    });

    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [profile, roles, linkedAgent, linkedMerchant, linkedCooperative, transactions, invoices, enrolledMerchants]);

  const stats = useMemo(() => ({
    totalTransactions: transactions.length,
    totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    enrollmentsCount: enrolledMerchants.length,
    invoicesCount: invoices.length,
  }), [transactions, enrolledMerchants, invoices]);

  return {
    data: {
      profile,
      roles: roles.map(r => r.role),
      linkedAgent,
      linkedMerchant,
      linkedCooperative,
      activities,
      stats,
    } as UserDetailData,
    isLoading,
    error,
    refetch: fetchData,
  };
};
