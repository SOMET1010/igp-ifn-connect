/**
 * Page de gestion des producteurs de la coopérative
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { EnhancedHeader, UnifiedBottomNav, LoadingState, ErrorState } from '@/shared/ui';
import { Tractor } from 'lucide-react';
import { useCooperativeDashboard } from '@/features/cooperative';
import { useCooperativeProducers } from '@/features/cooperative/hooks/useCooperativeProducers';
import { 
  ProducerStatsCards, 
  ProducersList, 
  AddProducerDialog 
} from '@/features/cooperative/components/producers';
import { cooperativeNavItems } from '@/config/navigation';

const CooperativeProducers: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const navItems = cooperativeNavItems;

  const { cooperative, isLoading: isLoadingCoop, error: errorCoop } = useCooperativeDashboard();

  const {
    producers,
    stats,
    isLoading,
    error,
    refetch,
    addProducer,
    isAdding,
    toggleStatus,
    isToggling,
  } = useCooperativeProducers(cooperative?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate('/cooperative/login');
  };

  if (isLoadingCoop || isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <EnhancedHeader title="Producteurs" subtitle={cooperative?.name} showSignOut onSignOut={handleSignOut} />
        <LoadingState message="Chargement des producteurs..." />
        <UnifiedBottomNav items={navItems} />
      </div>
    );
  }

  if (errorCoop || error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <EnhancedHeader title="Producteurs" subtitle="Coopérative" showSignOut onSignOut={handleSignOut} />
        <div className="p-4">
          <ErrorState 
            message={error?.message || errorCoop?.message || "Erreur de chargement"} 
            onRetry={refetch} 
          />
        </div>
        <UnifiedBottomNav items={navItems} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <EnhancedHeader 
        title="Producteurs" 
        subtitle={cooperative?.name}
        showSignOut 
        onSignOut={handleSignOut}
        rightContent={
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Tractor className="h-4 w-4" />
            {stats.total}
          </div>
        }
      />

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Statistiques */}
        <ProducerStatsCards stats={stats} />

        {/* Action d'ajout */}
        <div className="flex justify-end">
          <AddProducerDialog onAdd={addProducer} isAdding={isAdding} />
        </div>

        {/* Liste des producteurs */}
        <ProducersList 
          producers={producers} 
          onToggleStatus={(id, active) => toggleStatus({ producerId: id, isActive: active })}
          isToggling={isToggling}
        />
      </div>

      <UnifiedBottomNav items={navItems} />
    </div>
  );
};

export default CooperativeProducers;
