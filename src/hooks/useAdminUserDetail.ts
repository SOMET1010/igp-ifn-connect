import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

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

interface ProfileData {
  id: string;
  userId: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LinkedAgent {
  id: string;
  employeeId: string;
  organization: string;
  zone: string | null;
  isActive: boolean;
  totalEnrollments: number;
  createdAt: string;
}

interface LinkedMerchant {
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

interface LinkedCooperative {
  id: string;
  name: string;
  code: string;
  region: string;
  commune: string;
  totalMembers: number;
  createdAt: string;
}

export interface UserDetailData {
  profile: ProfileData | null;
  roles: AppRole[];
  linkedAgent: LinkedAgent | null;
  linkedMerchant: LinkedMerchant | null;
  linkedCooperative: LinkedCooperative | null;
  activities: UserActivity[];
  stats: {
    totalTransactions: number;
    totalAmount: number;
    enrollmentsCount: number;
    invoicesCount: number;
  };
}

export const useAdminUserDetail = (userId: string | undefined) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [roles, setRoles] = useState<{ role: AppRole; createdAt: string }[]>([]);
  const [linkedAgent, setLinkedAgent] = useState<LinkedAgent | null>(null);
  const [linkedMerchant, setLinkedMerchant] = useState<LinkedMerchant | null>(null);
  const [linkedCooperative, setLinkedCooperative] = useState<LinkedCooperative | null>(null);
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
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

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
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, created_at')
        .eq('user_id', userId);

      if (rolesError) throw rolesError;
      setRoles(rolesData?.map(r => ({ role: r.role, createdAt: r.created_at })) || []);

      // Fetch linked agent
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (agentError) throw agentError;
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

        // Fetch merchants enrolled by this agent
        const { data: enrolledData } = await supabase
          .from('merchants')
          .select('id, full_name, enrolled_at')
          .eq('enrolled_by', agentData.id)
          .order('enrolled_at', { ascending: false })
          .limit(50);

        setEnrolledMerchants(enrolledData?.map(m => ({
          id: m.id,
          fullName: m.full_name,
          enrolledAt: m.enrolled_at,
        })) || []);
      }

      // Fetch linked merchant
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*, markets(name)')
        .eq('user_id', userId)
        .maybeSingle();

      if (merchantError) throw merchantError;
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

        // Fetch transactions for this merchant
        const { data: txData } = await supabase
          .from('transactions')
          .select('id, amount, created_at, reference, transaction_type')
          .eq('merchant_id', merchantData.id)
          .order('created_at', { ascending: false })
          .limit(50);

        setTransactions(txData?.map(t => ({
          id: t.id,
          amount: Number(t.amount),
          createdAt: t.created_at,
          reference: t.reference,
          type: t.transaction_type,
        })) || []);

        // Fetch invoices for this merchant
        const { data: invData } = await supabase
          .from('invoices')
          .select('id, invoice_number, amount_ttc, created_at')
          .eq('merchant_id', merchantData.id)
          .order('created_at', { ascending: false })
          .limit(50);

        setInvoices(invData?.map(i => ({
          id: i.id,
          invoiceNumber: i.invoice_number,
          amountTtc: Number(i.amount_ttc),
          createdAt: i.created_at,
        })) || []);
      }

      // Fetch linked cooperative
      const { data: coopData, error: coopError } = await supabase
        .from('cooperatives')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (coopError) throw coopError;
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

  // Build activities timeline
  const activities = useMemo<UserActivity[]>(() => {
    const items: UserActivity[] = [];

    // Account created
    if (profile) {
      items.push({
        id: `account-${profile.id}`,
        type: 'account_created',
        description: 'Compte créé',
        timestamp: profile.createdAt,
        icon: 'UserPlus',
        color: 'bg-blue-500',
      });

      // Profile updated
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

    // Roles assigned
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

    // Agent created
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

    // Merchant created/validated
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

    // Cooperative created
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

    // Enrollments by agent
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

    // Transactions
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

    // Invoices
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

    // Sort by date descending
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [profile, roles, linkedAgent, linkedMerchant, linkedCooperative, transactions, invoices, enrolledMerchants]);

  // Stats
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
