/**
 * Types pour le profil Client/Bénéficiaire
 */

export type ClientStatus = 'pending' | 'active' | 'suspended' | 'blocked';
export type KycLevel = 'level_0' | 'level_1' | 'level_2';
export type ServiceType = 'savings' | 'credit' | 'insurance' | 'mobile_money' | 'transfer';
export type ServiceStatus = 'pending' | 'active' | 'suspended' | 'terminated';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'payment' | 'fee';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Client {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  region?: string;
  status: ClientStatus;
  kyc_level: KycLevel;
  balance: number;
  registered_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialService {
  id: string;
  name: string;
  type: ServiceType;
  description?: string;
  provider_name: string;
  icon?: string;
  min_amount: number;
  max_amount?: number;
  interest_rate?: number;
  fees: Record<string, number>;
  eligibility_criteria: Record<string, unknown>;
  min_kyc_level: KycLevel;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface ClientService {
  id: string;
  client_id: string;
  service_id: string;
  status: ServiceStatus;
  activated_at?: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  service?: FinancialService;
}

export interface ClientTransaction {
  id: string;
  client_id: string;
  service_id?: string;
  type: TransactionType;
  amount: number;
  fee_amount: number;
  balance_after?: number;
  status: TransactionStatus;
  reference?: string;
  description?: string;
  counterparty_phone?: string;
  counterparty_name?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// KYC Level descriptions
export const KYC_LEVEL_INFO: Record<KycLevel, { label: string; description: string; requirements: string[] }> = {
  level_0: {
    label: 'Niveau 0 - Téléphone',
    description: 'Accès de base avec numéro de téléphone vérifié',
    requirements: ['Numéro de téléphone vérifié par OTP'],
  },
  level_1: {
    label: 'Niveau 1 - Identité',
    description: 'Accès intermédiaire avec informations personnelles',
    requirements: ['Email vérifié', 'Adresse complète', 'Date de naissance'],
  },
  level_2: {
    label: 'Niveau 2 - Document',
    description: 'Accès complet avec document d\'identité',
    requirements: ['Document d\'identité', 'Photo selfie', 'Vérification manuelle'],
  },
};

// Service type icons mapping
export const SERVICE_TYPE_ICONS: Record<ServiceType, string> = {
  savings: 'piggy-bank',
  credit: 'banknote',
  insurance: 'shield',
  mobile_money: 'smartphone',
  transfer: 'send',
};

// Service type colors
export const SERVICE_TYPE_COLORS: Record<ServiceType, string> = {
  savings: 'bg-emerald-500',
  credit: 'bg-amber-500',
  insurance: 'bg-blue-500',
  mobile_money: 'bg-orange-500',
  transfer: 'bg-violet-500',
};
