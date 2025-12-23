import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Search, MapPin, Phone, Calendar, ClipboardList, Users } from 'lucide-react';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { UnifiedListCard } from '@/components/shared/UnifiedListCard';
import { PageHero } from '@/components/shared/PageHero';
import { FilterChips } from '@/components/shared/FilterChips';
import { agentNavItems } from '@/config/navigation';
import { EmptyState, LoadingState } from '@/components/shared/StateComponents';
import type { Database } from '@/integrations/supabase/types';
import type { StatusType } from '@/components/shared/StatusBadge';

type Merchant = Database['public']['Tables']['merchants']['Row'];
type MerchantStatus = Database['public']['Enums']['merchant_status'];

const statusToStatusType: Record<MerchantStatus, StatusType> = {
  pending: 'pending',
  validated: 'validated',
  rejected: 'rejected',
  suspended: 'suspended',
};

const MerchantList: React.FC = () => {
  const { user } = useAuth();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMerchants = async () => {
      if (!user) return;

      const { data: agentData } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!agentData) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('enrolled_by', agentData.id)
        .order('enrolled_at', { ascending: false });

      if (!error) {
        setMerchants(data ?? []);
      }
      
      setIsLoading(false);
    };

    fetchMerchants();
  }, [user]);

  useEffect(() => {
    let result = merchants;

    // Filtre par statut
    if (statusFilter !== 'all') {
      result = result.filter(m => m.status === statusFilter);
    }

    // Filtre par recherche
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.full_name.toLowerCase().includes(query) ||
          m.cmu_number.toLowerCase().includes(query) ||
          m.phone.includes(query) ||
          m.activity_type.toLowerCase().includes(query)
      );
    }

    setFilteredMerchants(result);
  }, [searchQuery, statusFilter, merchants]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Compteurs par statut
  const countByStatus = {
    all: merchants.length,
    pending: merchants.filter(m => m.status === 'pending').length,
    validated: merchants.filter(m => m.status === 'validated').length,
    rejected: merchants.filter(m => m.status === 'rejected').length,
    suspended: merchants.filter(m => m.status === 'suspended').length,
  };

  const filterOptions = [
    { value: 'all', label: 'Tous', count: countByStatus.all },
    { value: 'pending', label: 'En attente', count: countByStatus.pending },
    { value: 'validated', label: 'Validés', count: countByStatus.validated },
    { value: 'rejected', label: 'Rejetés', count: countByStatus.rejected },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <UnifiedHeader
        title="Mes Marchands"
        showBack
        backTo="/agent"
      />

      {/* Hero avec compteur */}
      <PageHero
        title="Marchands enrôlés"
        subtitle="Suivez l'état de vos inscriptions"
        count={filteredMerchants.length}
        countLabel="enrôlé(s)"
        icon={Users}
        variant="primary"
      >
        <FilterChips
          options={filterOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </PageHero>

      {/* Barre de recherche */}
      <div className="p-4 sticky top-[73px] bg-background z-10 border-b border-border">
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, CMU, téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>
      </div>

      {/* Liste */}
      <div className="p-4 space-y-3 max-w-lg mx-auto">
        {isLoading ? (
          <LoadingState message="Chargement des marchands..." />
        ) : filteredMerchants.length === 0 ? (
          <EmptyState
            Icon={ClipboardList}
            title={searchQuery || statusFilter !== 'all' ? 'Aucun résultat' : 'Aucun marchand enrôlé'}
            message={searchQuery || statusFilter !== 'all'
              ? 'Essayez avec d\'autres critères de recherche'
              : 'Commencez par enrôler votre premier marchand'}
          />
        ) : (
          filteredMerchants.map((merchant) => (
            <UnifiedListCard
              key={merchant.id}
              title={merchant.full_name}
              subtitle={merchant.activity_type}
              avatarFallback={merchant.full_name}
              entityType="merchant"
              status={statusToStatusType[merchant.status ?? 'pending']}
              showChevron={false}
              metadata={[
                { icon: Phone, text: merchant.phone },
                { icon: Calendar, text: `Enrôlé le ${formatDate(merchant.enrolled_at)}` },
                ...(merchant.latitude && merchant.longitude 
                  ? [{ icon: MapPin, text: 'GPS capturé', className: 'text-secondary' }] 
                  : []
                ),
              ]}
              description={`CMU: ${merchant.cmu_number}`}
            />
          ))
        )}
      </div>

      <UnifiedBottomNav items={agentNavItems} />
    </div>
  );
};

export default MerchantList;