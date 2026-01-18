/**
 * Page Vérification KYC - /marchand/kyc
 * Refactorisée avec Design System Jùlaba
 */

import { useNavigate } from 'react-router-dom';
import { 
  JulabaPageLayout, 
  JulabaHeader, 
  JulabaCard, 
  JulabaButton,
  JulabaStepIndicator,
} from '@/shared/ui/julaba';
import { KycWizard, useKycStatus, KYC_LEVELS_CONFIG, KYC_STATUS_LABELS } from '@/features/kyc';
import { Loader2 } from 'lucide-react';

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
      <JulabaPageLayout background="warm" className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </JulabaPageLayout>
    );
  }

  // Si KYC en cours de validation ou approuvé, afficher le statut
  if (kycStatus === 'submitted' || kycStatus === 'under_review' || kycStatus === 'approved') {
    return (
      <JulabaPageLayout background="warm">
        <JulabaHeader
          title="🛡️ Vérification"
          backPath="/marchand"
        />

        <main className="p-4 space-y-6 max-w-lg mx-auto">
          {/* Statut actuel */}
          <JulabaCard 
            accent={kycStatus === 'approved' ? 'green' : 'orange'}
            className="text-center py-6"
          >
            <div className="text-6xl mb-4">
              {kycStatus === 'approved' ? '✅' : kycStatus === 'submitted' ? '📤' : '🔍'}
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {statusConfig?.label}
            </h2>
            
            <p className="text-muted-foreground">
              {kycStatus === 'approved' 
                ? 'Ton identité est vérifiée. Tu as accès à tous les services.'
                : kycStatus === 'submitted'
                ? 'Ta demande est en attente de validation.'
                : 'Nos équipes examinent tes documents.'}
            </p>

            {/* Niveau actuel */}
            <div className="mt-6 p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl">{levelConfig.icon}</span>
                <span className="font-bold text-lg">{levelConfig.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{levelConfig.description}</p>
            </div>
          </JulabaCard>

          {/* Avantages du niveau */}
          <JulabaCard>
            <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="text-xl">🎁</span>
              Tes avantages
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className={levelConfig.limits.canAccessWallet ? 'text-2xl' : 'text-2xl opacity-30'}>
                  💳
                </span>
                <span className={levelConfig.limits.canAccessWallet ? 'text-foreground' : 'text-muted-foreground'}>
                  Portefeuille numérique
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={levelConfig.limits.canAccessCredit ? 'text-2xl' : 'text-2xl opacity-30'}>
                  💰
                </span>
                <span className={levelConfig.limits.canAccessCredit ? 'text-foreground' : 'text-muted-foreground'}>
                  Accès au crédit
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={levelConfig.limits.canAccessInsurance ? 'text-2xl' : 'text-2xl opacity-30'}>
                  🏥
                </span>
                <span className={levelConfig.limits.canAccessInsurance ? 'text-foreground' : 'text-muted-foreground'}>
                  Assurance maladie
                </span>
              </div>
            </div>
          </JulabaCard>

          {/* Limites */}
          <JulabaCard>
            <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="text-xl">📊</span>
              Limites de transaction
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground">Par jour</p>
                <p className="text-lg font-bold text-foreground">
                  {(levelConfig.limits.dailyTransactionLimit).toLocaleString()} F
                </p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground">Par mois</p>
                <p className="text-lg font-bold text-foreground">
                  {(levelConfig.limits.monthlyTransactionLimit).toLocaleString()} F
                </p>
              </div>
            </div>
          </JulabaCard>

          <JulabaButton
            variant="secondary"
            className="w-full"
            onClick={() => navigate('/marchand')}
          >
            Retour à l'accueil
          </JulabaButton>
        </main>
      </JulabaPageLayout>
    );
  }

  // Si rejeté, afficher le message et permettre de recommencer
  if (kycStatus === 'rejected') {
    return (
      <JulabaPageLayout background="warm">
        <JulabaHeader
          title="🛡️ Vérification"
          backPath="/marchand"
        />

        <main className="p-4 space-y-6 max-w-lg mx-auto">
          <JulabaCard accent="orange" className="text-center py-6">
            <div className="text-6xl mb-4">❌</div>

            <h2 className="text-xl font-bold text-destructive mb-2">
              Demande refusée
            </h2>

            {kycRequest?.rejection_reason && (
              <p className="text-destructive bg-destructive/10 p-3 rounded-lg text-sm mb-4">
                {kycRequest.rejection_reason}
              </p>
            )}

            <p className="text-muted-foreground text-sm">
              Tu peux soumettre de nouveaux documents.
            </p>
          </JulabaCard>

          <KycWizard 
            existingRequest={kycRequest}
            onComplete={handleComplete}
            onCancel={() => navigate('/marchand')}
          />
        </main>
      </JulabaPageLayout>
    );
  }

  // Formulaire KYC standard
  return (
    <JulabaPageLayout background="warm">
      <JulabaHeader
        title="🛡️ Vérification"
        backPath="/marchand"
      />

      <main className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Avantages du niveau 2 */}
        <JulabaCard accent="green">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🔓</span>
            <div>
              <h4 className="font-bold text-foreground mb-2">Débloque tous les services</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span>💵</span> Limite journalière : 500.000 FCFA
                </li>
                <li className="flex items-center gap-2">
                  <span>💰</span> Accès au crédit et micro-prêts
                </li>
                <li className="flex items-center gap-2">
                  <span>🏥</span> Assurance maladie CMU
                </li>
                <li className="flex items-center gap-2">
                  <span>🔄</span> Transferts illimités
                </li>
              </ul>
            </div>
          </div>
        </JulabaCard>

        <KycWizard 
          existingRequest={kycRequest}
          onComplete={handleComplete}
          onCancel={() => navigate('/marchand')}
        />
      </main>
    </JulabaPageLayout>
  );
}
