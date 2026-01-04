import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Check,
  X,
  Pause,
  Loader2,
  Phone,
  MapPin,
  Store,
  Calendar
} from 'lucide-react';
import { EnhancedHeader } from '@/components/shared/EnhancedHeader';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { UnifiedListCard } from '@/components/shared/UnifiedListCard';
import { PageHero } from '@/components/shared/PageHero';
import { FilterChips } from '@/components/shared/FilterChips';
import { AnimatedList } from '@/components/shared/AnimatedList';
import { AnimatedListItem } from '@/components/shared/AnimatedListItem';
import { SearchInput } from '@/components/shared/SearchInput';
import { adminNavItems } from '@/config/navigation';
import type { StatusType } from '@/components/shared/StatusBadge';

interface Merchant {
  id: string;
  full_name: string;
  phone: string;
  activity_type: string;
  status: 'pending' | 'validated' | 'rejected' | 'suspended';
  cmu_number: string;
  enrolled_at: string;
  market_name?: string;
}

const statusToStatusType: Record<string, StatusType> = {
  pending: 'pending',
  validated: 'validated',
  rejected: 'rejected',
  suspended: 'suspended',
};

const AdminMerchants: React.FC = () => {
  const navigate = useNavigate();
  
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMerchants = async () => {
    let query = supabase
      .from('merchants')
      .select(`
        id,
        full_name,
        phone,
        activity_type,
        status,
        cmu_number,
        enrolled_at,
        market_id
      `)
      .order('enrolled_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter as 'pending' | 'validated' | 'rejected' | 'suspended');
    }

    const { data } = await query;

    if (data) {
      const marketIds = data.filter(m => m.market_id).map(m => m.market_id);
      const { data: markets } = await supabase
        .from('markets')
        .select('id, name')
        .in('id', marketIds);

      const enrichedMerchants = data.map(m => ({
        ...m,
        status: m.status as Merchant['status'],
        market_name: markets?.find(market => market.id === m.market_id)?.name
      }));

      setMerchants(enrichedMerchants);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchMerchants();
  }, [statusFilter]);

  const updateStatus = async (id: string, newStatus: 'validated' | 'rejected' | 'suspended') => {
    setUpdatingId(id);

    const updateData: { status: 'validated' | 'rejected' | 'suspended'; validated_at?: string } = { status: newStatus };
    if (newStatus === 'validated') {
      updateData.validated_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('merchants')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success(`Marchand ${newStatus === 'validated' ? 'validé' : newStatus === 'rejected' ? 'rejeté' : 'suspendu'}`);
      await fetchMerchants();
    }

    setUpdatingId(null);
  };

  const filteredMerchants = merchants.filter(m =>
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery) ||
    m.cmu_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    { value: 'suspended', label: 'Suspendus', count: countByStatus.suspended },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <EnhancedHeader
        title="Marchands"
        showBack
        backTo="/admin"
      />

      {/* Hero avec compteur et filtres */}
      <PageHero
        title="Gestion des marchands"
        subtitle="Validez et gérez les inscriptions"
        count={filteredMerchants.length}
        countLabel="marchand(s)"
        icon={Store}
        variant="secondary"
      >
        {/* Filtres en chips */}
        <FilterChips
          options={filterOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </PageHero>

      {/* Barre de recherche */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Rechercher par nom, téléphone, CMU..."
        sticky
      />

      {/* Liste des marchands */}
      <div className="p-4 max-w-lg mx-auto">
        {filteredMerchants.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun marchand trouvé</p>
          </div>
        ) : (
          <AnimatedList className="space-y-3">
            {filteredMerchants.map((merchant) => (
              <AnimatedListItem key={merchant.id}>
                <UnifiedListCard
                  title={merchant.full_name}
                  subtitle={merchant.activity_type}
                  avatarFallback={merchant.full_name}
                  entityType="merchant"
                  status={statusToStatusType[merchant.status]}
                  showChevron={false}
                  metadata={[
                    { icon: Phone, text: `+225 ${merchant.phone}` },
                    ...(merchant.market_name ? [{ icon: MapPin, text: merchant.market_name }] : []),
                    { icon: Calendar, text: formatDate(merchant.enrolled_at) },
                  ]}
                  actions={
                    <>
                      {merchant.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(merchant.id, 'validated')}
                            disabled={updatingId === merchant.id}
                            className="flex-1 bg-secondary hover:bg-secondary/90"
                          >
                            {updatingId === merchant.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Valider
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(merchant.id, 'rejected')}
                            disabled={updatingId === merchant.id}
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {merchant.status === 'validated' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(merchant.id, 'suspended')}
                          disabled={updatingId === merchant.id}
                          className="w-full"
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Suspendre
                        </Button>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        CMU: {merchant.cmu_number}
                      </p>
                    </>
                  }
                />
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
      </div>

      <UnifiedBottomNav items={adminNavItems} />
    </div>
  );
};

export default AdminMerchants;