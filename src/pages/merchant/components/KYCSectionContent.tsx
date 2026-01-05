/**
 * Contenu de la section KYC (intégré dans MerchantProfile)
 * Extrait de MerchantKyc.tsx
 */

import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKycStatus, KYC_LEVELS_CONFIG, KYC_STATUS_LABELS } from '@/features/kyc';

export function KYCSectionContent() {
  const navigate = useNavigate();
  const { kycLevel, kycStatus, isLoading } = useKycStatus();

  const levelConfig = KYC_LEVELS_CONFIG[kycLevel];
  const statusConfig = kycStatus ? KYC_STATUS_LABELS[kycStatus] : null;

  if (isLoading) {
    return <div className="py-4 text-center text-muted-foreground">Chargement...</div>;
  }

  // Statut visuel
  const getStatusIcon = () => {
    switch (kycStatus) {
      case 'approved':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'submitted':
      case 'under_review':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Shield className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (kycStatus) {
      case 'approved': return 'bg-green-100 border-green-300';
      case 'submitted':
      case 'under_review': return 'bg-blue-100 border-blue-300';
      case 'rejected': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Statut actuel */}
      <div className={`p-4 rounded-xl border-2 ${getStatusColor()}`}>
        <div className="flex items-center gap-3 mb-2">
          {getStatusIcon()}
          <div>
            <p className="font-bold text-foreground">{statusConfig?.label || 'Non vérifié'}</p>
            <p className="text-sm text-muted-foreground">
              Niveau: {levelConfig.label}
            </p>
          </div>
        </div>

        {/* Avantages du niveau */}
        <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className={`w-4 h-4 ${levelConfig.limits.canAccessWallet ? 'text-green-500' : 'text-gray-300'}`} />
            <span className={levelConfig.limits.canAccessWallet ? 'text-foreground' : 'text-muted-foreground'}>
              Portefeuille numérique
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className={`w-4 h-4 ${levelConfig.limits.canAccessCredit ? 'text-green-500' : 'text-gray-300'}`} />
            <span className={levelConfig.limits.canAccessCredit ? 'text-foreground' : 'text-muted-foreground'}>
              Accès au crédit
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className={`w-4 h-4 ${levelConfig.limits.canAccessInsurance ? 'text-green-500' : 'text-gray-300'}`} />
            <span className={levelConfig.limits.canAccessInsurance ? 'text-foreground' : 'text-muted-foreground'}>
              Assurance maladie
            </span>
          </div>
        </div>
      </div>

      {/* Limites */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Limite / jour</p>
          <p className="text-lg font-bold text-foreground">
            {(levelConfig.limits.dailyTransactionLimit).toLocaleString()} F
          </p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Limite / mois</p>
          <p className="text-lg font-bold text-foreground">
            {(levelConfig.limits.monthlyTransactionLimit).toLocaleString()} F
          </p>
        </div>
      </div>

      {/* Bouton action selon statut */}
      {kycStatus !== 'approved' && (
        <Button 
          className="w-full"
          onClick={() => navigate('/marchand/kyc')}
        >
          {kycStatus === 'rejected' ? 'Soumettre à nouveau' : 'Vérifier mon identité'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
