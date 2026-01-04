import React from 'react';
import { motion } from 'framer-motion';
import { 
  PiggyBank, Banknote, Shield, Smartphone, Send, 
  ChevronRight, Lock, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import type { FinancialService, KycLevel, ServiceType } from '../types/client.types';

interface ServiceCardProps {
  service: FinancialService;
  isActivated?: boolean;
  clientKycLevel?: KycLevel;
  onActivate?: () => void;
  onView?: () => void;
}

const SERVICE_ICONS: Record<ServiceType, React.ReactNode> = {
  savings: <PiggyBank className="w-6 h-6" />,
  credit: <Banknote className="w-6 h-6" />,
  insurance: <Shield className="w-6 h-6" />,
  mobile_money: <Smartphone className="w-6 h-6" />,
  transfer: <Send className="w-6 h-6" />,
};

const SERVICE_COLORS: Record<ServiceType, string> = {
  savings: 'from-emerald-500 to-emerald-600',
  credit: 'from-amber-500 to-amber-600',
  insurance: 'from-blue-500 to-blue-600',
  mobile_money: 'from-orange-500 to-orange-600',
  transfer: 'from-violet-500 to-violet-600',
};

const KYC_LEVEL_ORDER: KycLevel[] = ['level_0', 'level_1', 'level_2'];

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isActivated = false,
  clientKycLevel = 'level_0',
  onActivate,
  onView,
}) => {
  const serviceType = service.type as ServiceType;
  const icon = SERVICE_ICONS[serviceType] || <PiggyBank className="w-6 h-6" />;
  const colorClass = SERVICE_COLORS[serviceType] || 'from-gray-500 to-gray-600';
  
  const clientLevelIndex = KYC_LEVEL_ORDER.indexOf(clientKycLevel);
  const requiredLevelIndex = KYC_LEVEL_ORDER.indexOf(service.min_kyc_level as KycLevel);
  const isEligible = clientLevelIndex >= requiredLevelIndex;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard className="p-4 relative overflow-hidden">
        {/* Status Badge */}
        {isActivated && (
          <Badge className="absolute top-3 right-3 bg-emerald-500 text-white">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Activé
          </Badge>
        )}
        
        {!isEligible && (
          <Badge className="absolute top-3 right-3 bg-muted text-muted-foreground">
            <Lock className="w-3 h-3 mr-1" />
            KYC requis
          </Badge>
        )}

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{service.name}</h3>
            <p className="text-sm text-muted-foreground">{service.provider_name}</p>
            
            {service.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {service.description}
              </p>
            )}

            {/* Details */}
            <div className="flex flex-wrap gap-2 mt-3">
              {service.min_amount > 0 && (
                <Badge variant="outline" className="text-xs">
                  Min: {formatAmount(service.min_amount)} FCFA
                </Badge>
              )}
              {service.interest_rate && (
                <Badge variant="outline" className="text-xs">
                  Taux: {service.interest_rate}%
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex justify-end">
          {isActivated ? (
            <Button variant="outline" size="sm" onClick={onView}>
              Voir détails
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onActivate}
              disabled={!isEligible}
              className={`${isEligible ? `bg-gradient-to-r ${colorClass} hover:opacity-90` : ''}`}
            >
              {isEligible ? 'Activer' : 'Compléter KYC'}
            </Button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};
