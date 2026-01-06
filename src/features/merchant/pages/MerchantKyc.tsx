import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/shared/ui';
import { KycWizard, useKycStatus, KYC_LEVELS_CONFIG, KYC_STATUS_LABELS } from '@/features/kyc';

export default function MerchantKyc() {
  const navigate = useNavigate();
  const { kycLevel, kycStatus, kycRequest, isLoading, refetch } = useKycStatus();

  const levelConfig = KYC_LEVELS_CONFIG[kycLevel];
  const statusConfig = kycStatus ? KYC_STATUS_LABELS[kycStatus] : null;

  const handleComplete = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sable-doux to-white p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  // Si KYC en cours de validation ou approuvé, afficher le statut
  if (kycStatus === 'submitted' || kycStatus === 'under_review' || kycStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sable-doux to-white p-4 safe-area-inset">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/marchand')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-charbon">Vérification d'identité</h1>
        </div>

        {/* Statut actuel */}
        <GlassCard padding="lg" className="text-center mb-6">
          <div className={`
            w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4
            ${kycStatus === 'approved' ? 'bg-green-100' : 
              kycStatus === 'submitted' ? 'bg-blue-100' : 'bg-orange-100'}
          `}>
            {kycStatus === 'approved' ? (
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            ) : kycStatus === 'submitted' ? (
              <Clock className="w-10 h-10 text-blue-600" />
            ) : (
              <Shield className="w-10 h-10 text-orange-600" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-charbon mb-2">
            {statusConfig?.label}
          </h2>
          
          <p className="text-charbon/60">
            {kycStatus === 'approved' 
              ? 'Votre identité a été vérifiée. Vous avez accès à tous les services.'
              : kycStatus === 'submitted'
              ? 'Votre demande est en attente de validation par nos équipes.'
              : 'Nos équipes examinent actuellement vos documents.'}
          </p>

          {/* Niveau actuel */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{levelConfig.icon}</span>
              <span className="font-bold text-lg">{levelConfig.label}</span>
            </div>
            <p className="text-sm text-gray-600">{levelConfig.description}</p>
          </div>

          {/* Avantages du niveau */}
          <div className="mt-4 text-left">
            <h4 className="font-medium text-charbon mb-2">Vos avantages :</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`w-4 h-4 ${levelConfig.limits.canAccessWallet ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={levelConfig.limits.canAccessWallet ? 'text-charbon' : 'text-gray-400'}>
                  Portefeuille numérique
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`w-4 h-4 ${levelConfig.limits.canAccessCredit ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={levelConfig.limits.canAccessCredit ? 'text-charbon' : 'text-gray-400'}>
                  Accès au crédit
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`w-4 h-4 ${levelConfig.limits.canAccessInsurance ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={levelConfig.limits.canAccessInsurance ? 'text-charbon' : 'text-gray-400'}>
                  Assurance maladie
                </span>
              </li>
            </ul>
          </div>
        </GlassCard>

        {/* Limites */}
        <GlassCard padding="md">
          <h4 className="font-medium text-charbon mb-3">Limites de transaction</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Par jour</p>
              <p className="text-lg font-bold text-charbon">
                {(levelConfig.limits.dailyTransactionLimit).toLocaleString()} F
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Par mois</p>
              <p className="text-lg font-bold text-charbon">
                {(levelConfig.limits.monthlyTransactionLimit).toLocaleString()} F
              </p>
            </div>
          </div>
        </GlassCard>

        <Button
          variant="outline"
          className="w-full mt-6"
          onClick={() => navigate('/marchand')}
        >
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  // Si rejeté, afficher le message et permettre de recommencer
  if (kycStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sable-doux to-white p-4 safe-area-inset">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/marchand')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-charbon">Vérification d'identité</h1>
        </div>

        <GlassCard borderColor="orange" padding="lg" className="text-center mb-6 border-red-300 bg-red-50/50">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <h2 className="text-xl font-bold text-red-700 mb-2">
            Demande refusée
          </h2>

          {kycRequest?.rejection_reason && (
            <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm mb-4">
              {kycRequest.rejection_reason}
            </p>
          )}

          <p className="text-charbon/60 text-sm">
            Veuillez soumettre de nouveaux documents conformes.
          </p>
        </GlassCard>

        <KycWizard 
          existingRequest={kycRequest}
          onComplete={handleComplete}
          onCancel={() => navigate('/marchand')}
        />
      </div>
    );
  }

  // Formulaire KYC standard
  return (
    <div className="min-h-screen bg-gradient-to-b from-sable-doux to-white p-4 safe-area-inset">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/marchand')}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-charbon">Vérification d'identité</h1>
          <p className="text-sm text-charbon/60">Niveau 2 - Documents</p>
        </div>
      </div>

      {/* Avantages du niveau 2 */}
      <GlassCard borderColor="green" padding="md" className="mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-vert-manioc flex-shrink-0" />
          <div>
            <h4 className="font-medium text-charbon">Débloquez tous les services</h4>
            <ul className="text-sm text-charbon/70 mt-2 space-y-1">
              <li>✓ Limite journalière : 500.000 FCFA</li>
              <li>✓ Accès au crédit et micro-prêts</li>
              <li>✓ Assurance maladie CMU</li>
              <li>✓ Transferts illimités</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      <KycWizard 
        existingRequest={kycRequest}
        onComplete={handleComplete}
        onCancel={() => navigate('/marchand')}
      />
    </div>
  );
}
