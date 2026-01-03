import { AlertTriangle, Shield, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useKycStatus } from '../hooks/useKycStatus';
import type { KycLevel } from '../types/kyc.types';

interface KycBannerProps {
  requiredLevel?: KycLevel;
  feature?: string;
  showAction?: boolean;
  className?: string;
}

export function KycBanner({ 
  requiredLevel = 'level_2', 
  feature = 'cette fonctionnalité',
  showAction = true,
  className = ''
}: KycBannerProps) {
  const navigate = useNavigate();
  const { kycLevel, kycStatus, isLoading, isLevelSufficient } = useKycStatus();

  if (isLoading) return null;
  
  // Si le niveau est suffisant, ne pas afficher la bannière
  if (isLevelSufficient(requiredLevel)) return null;

  const getStatusMessage = () => {
    switch (kycStatus) {
      case 'submitted':
        return {
          icon: <Shield className="w-5 h-5 text-blue-500" />,
          title: 'Vérification en cours',
          message: 'Votre demande de vérification est en attente de validation.',
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
        };
      case 'under_review':
        return {
          icon: <Shield className="w-5 h-5 text-orange-500" />,
          title: 'Examen en cours',
          message: 'Nos équipes examinent actuellement vos documents.',
          bgColor: 'bg-orange-50 border-orange-200',
          textColor: 'text-orange-800',
        };
      case 'rejected':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          title: 'Vérification refusée',
          message: 'Votre demande a été refusée. Veuillez soumettre de nouveaux documents.',
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
        };
      default:
        return {
          icon: <Lock className="w-5 h-5 text-amber-500" />,
          title: 'Compte limité',
          message: `Pour accéder à ${feature}, complétez la vérification de votre identité.`,
          bgColor: 'bg-amber-50 border-amber-200',
          textColor: 'text-amber-800',
        };
    }
  };

  const { icon, title, message, bgColor, textColor } = getStatusMessage();

  return (
    <div className={`rounded-xl border p-4 ${bgColor} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${textColor}`}>
            {title}
          </h4>
          <p className={`text-sm mt-1 ${textColor} opacity-80`}>
            {message}
          </p>
          
          {showAction && kycStatus !== 'submitted' && kycStatus !== 'under_review' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/marchand/kyc')}
              className={`mt-2 p-0 h-auto font-medium ${textColor} hover:bg-transparent`}
            >
              Compléter mon identité
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Indicateur de niveau */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex gap-1">
          <div className={`w-8 h-1.5 rounded-full ${kycLevel !== 'level_0' ? 'bg-vert-manioc' : 'bg-gray-300'}`} />
          <div className={`w-8 h-1.5 rounded-full ${kycLevel === 'level_2' ? 'bg-vert-manioc' : 'bg-gray-300'}`} />
        </div>
        <span className={`text-xs ${textColor} opacity-70`}>
          Niveau {kycLevel === 'level_0' ? '0' : kycLevel === 'level_1' ? '1' : '2'} / 2
        </span>
      </div>
    </div>
  );
}
