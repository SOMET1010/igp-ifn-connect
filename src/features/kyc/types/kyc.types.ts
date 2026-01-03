// Types KYC pour le système de vérification progressive

export type KycLevel = 'level_0' | 'level_1' | 'level_2';
export type KycStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface KycRequest {
  id: string;
  user_id: string;
  merchant_id: string | null;
  level: KycLevel;
  status: KycStatus;
  // Level 1
  phone_verified: boolean;
  phone_verified_at: string | null;
  // Level 2
  id_document_type: 'cni' | 'passport' | 'cmu' | null;
  id_document_url: string | null;
  id_document_number: string | null;
  id_document_expiry: string | null;
  selfie_url: string | null;
  address: string | null;
  // Validation
  submitted_at: string | null;
  submitted_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  // Audit
  created_at: string;
  updated_at: string;
}

export interface KycLevelConfig {
  level: KycLevel;
  label: string;
  description: string;
  icon: string;
  color: string;
  requirements: string[];
  limits: {
    dailyTransactionLimit: number;
    monthlyTransactionLimit: number;
    canAccessCredit: boolean;
    canAccessWallet: boolean;
    canAccessInsurance: boolean;
  };
}

export const KYC_LEVELS_CONFIG: Record<KycLevel, KycLevelConfig> = {
  level_0: {
    level: 'level_0',
    label: 'Non vérifié',
    description: 'Compte créé, en attente de vérification',
    icon: '⚪',
    color: 'gray',
    requirements: [],
    limits: {
      dailyTransactionLimit: 0,
      monthlyTransactionLimit: 0,
      canAccessCredit: false,
      canAccessWallet: false,
      canAccessInsurance: false,
    },
  },
  level_1: {
    level: 'level_1',
    label: 'Téléphone vérifié',
    description: 'Numéro de téléphone confirmé par OTP',
    icon: '🟡',
    color: 'yellow',
    requirements: ['Numéro de téléphone vérifié par SMS'],
    limits: {
      dailyTransactionLimit: 50000, // 50.000 FCFA
      monthlyTransactionLimit: 500000, // 500.000 FCFA
      canAccessCredit: false,
      canAccessWallet: true,
      canAccessInsurance: false,
    },
  },
  level_2: {
    level: 'level_2',
    label: 'Identité vérifiée',
    description: 'Documents d\'identité validés',
    icon: '🟢',
    color: 'green',
    requirements: [
      'Numéro de téléphone vérifié',
      'Pièce d\'identité (CNI, Passeport ou CMU)',
      'Photo selfie',
      'Adresse de résidence',
    ],
    limits: {
      dailyTransactionLimit: 500000, // 500.000 FCFA
      monthlyTransactionLimit: 5000000, // 5.000.000 FCFA
      canAccessCredit: true,
      canAccessWallet: true,
      canAccessInsurance: true,
    },
  },
};

export const KYC_STATUS_LABELS: Record<KycStatus, { label: string; color: string; icon: string }> = {
  draft: { label: 'Brouillon', color: 'gray', icon: '📝' },
  submitted: { label: 'En attente', color: 'blue', icon: '⏳' },
  under_review: { label: 'En cours de vérification', color: 'orange', icon: '🔍' },
  approved: { label: 'Approuvé', color: 'green', icon: '✅' },
  rejected: { label: 'Rejeté', color: 'red', icon: '❌' },
};
