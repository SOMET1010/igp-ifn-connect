import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Search, MapPin, Phone, Clock, Home, Users, User, ClipboardList } from 'lucide-react';
import { SecondaryPageHeader } from '@/components/shared/SecondaryPageHeader';
import { InstitutionalBottomNav } from '@/components/shared/InstitutionalBottomNav';
import { EmptyState, LoadingState } from '@/components/shared/StateComponents';
import type { Database } from '@/integrations/supabase/types';

type Merchant = Database['public']['Tables']['merchants']['Row'];
type MerchantStatus = Database['public']['Enums']['merchant_status'];

const statusConfig: Record<MerchantStatus, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-warning/20 text-foreground border-warning' },
  validated: { label: 'Validé', className: 'bg-secondary/20 text-secondary border-secondary' },
  rejected: { label: 'Rejeté', className: 'bg-destructive/20 text-destructive border-destructive' },
  suspended: { label: 'Suspendu', className: 'bg-muted text-muted-foreground border-muted' },
};

const agentNavItems = [
  { icon: Home, label: 'Accueil', path: '/agent' },
  { icon: Users, label: 'Marchands', path: '/agent/marchands' },
  { icon: User, label: 'Profil', path: '/agent/profil' },
];

const MerchantList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
        setFilteredMerchants(data ?? []);
      }
      
      setIsLoading(false);
    };

    fetchMerchants();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMerchants(merchants);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMerchants(
        merchants.filter(
          (m) =>
            m.full_name.toLowerCase().includes(query) ||
            m.cmu_number.toLowerCase().includes(query) ||
            m.phone.includes(query) ||
            m.activity_type.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, merchants]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <SecondaryPageHeader
        title="Mes Marchands"
        subtitle={`${merchants.length} enrôlé${merchants.length !== 1 ? 's' : ''}`}
        onBack={() => navigate('/agent')}
      />

      {/* Search */}
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

      {/* List */}
      <div className="p-4 space-y-3 max-w-lg mx-auto">
        {isLoading ? (
          <LoadingState message="Chargement des marchands..." />
        ) : filteredMerchants.length === 0 ? (
          <EmptyState
            Icon={ClipboardList}
            title={searchQuery ? 'Aucun résultat' : 'Aucun marchand enrôlé'}
            message={searchQuery
              ? 'Essayez avec d\'autres termes de recherche'
              : 'Commencez par enrôler votre premier marchand'}
          />
        ) : (
          filteredMerchants.map((merchant) => (
            <Card key={merchant.id} className="card-institutional hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{merchant.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{merchant.activity_type}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={statusConfig[merchant.status ?? 'pending'].className}
                  >
                    {statusConfig[merchant.status ?? 'pending'].label}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                      CMU: {merchant.cmu_number}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{merchant.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Enrôlé le {formatDate(merchant.enrolled_at)}</span>
                  </div>

                  {merchant.latitude && merchant.longitude && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>GPS capturé</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <InstitutionalBottomNav items={agentNavItems} />
    </div>
  );
};

export default MerchantList;
