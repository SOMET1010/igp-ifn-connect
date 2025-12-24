import { supabase } from '@/integrations/supabase/client';
import type {
  UserProfile,
  UserRole,
  LinkedMerchant,
  LinkedAgent,
  LinkedCooperative,
  AppRole,
  UserActivity
} from '../types/users.types';

export interface UsersRawData {
  profiles: UserProfile[];
  roles: UserRole[];
  merchants: LinkedMerchant[];
  agents: LinkedAgent[];
  cooperatives: LinkedCooperative[];
}

export const usersService = {
  async getAllUsers(): Promise<UsersRawData> {
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

    return {
      profiles: profilesRes.data || [],
      roles: rolesRes.data || [],
      merchants: (merchantsRes.data || []) as LinkedMerchant[],
      agents: (agentsRes.data || []) as LinkedAgent[],
      cooperatives: (cooperativesRes.data || []) as LinkedCooperative[],
    };
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getUserRoles(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, created_at')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(r => ({ role: r.role as AppRole, createdAt: r.created_at })) || [];
  },

  async getLinkedAgent(userId: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getLinkedMerchant(userId: string) {
    const { data, error } = await supabase
      .from('merchants')
      .select('*, markets(name)')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getLinkedCooperative(userId: string) {
    const { data, error } = await supabase
      .from('cooperatives')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getEnrolledMerchants(agentId: string) {
    const { data } = await supabase
      .from('merchants')
      .select('id, full_name, enrolled_at')
      .eq('enrolled_by', agentId)
      .order('enrolled_at', { ascending: false })
      .limit(50);

    return data?.map(m => ({
      id: m.id,
      fullName: m.full_name,
      enrolledAt: m.enrolled_at,
    })) || [];
  },

  async getMerchantTransactions(merchantId: string) {
    const { data } = await supabase
      .from('transactions')
      .select('id, amount, created_at, reference, transaction_type')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(50);

    return data?.map(t => ({
      id: t.id,
      amount: Number(t.amount),
      createdAt: t.created_at,
      reference: t.reference,
      type: t.transaction_type,
    })) || [];
  },

  async getMerchantInvoices(merchantId: string) {
    const { data } = await supabase
      .from('invoices')
      .select('id, invoice_number, amount_ttc, created_at')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(50);

    return data?.map(i => ({
      id: i.id,
      invoiceNumber: i.invoice_number,
      amountTtc: Number(i.amount_ttc),
      createdAt: i.created_at,
    })) || [];
  }
};
