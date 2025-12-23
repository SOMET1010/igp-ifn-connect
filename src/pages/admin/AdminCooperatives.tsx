import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Wheat, MapPin, Users, Award, UserCog, Store, LayoutDashboard } from 'lucide-react';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { PageHero } from '@/components/shared/PageHero';
import { FilterChips } from '@/components/shared/FilterChips';
import { UnifiedListCard } from '@/components/shared/UnifiedListCard';
import { UnifiedBottomNav, NavItem } from '@/components/shared/UnifiedBottomNav';
import { LoadingState, EmptyState } from '@/components/shared/StateComponents';

interface Cooperative {
  id: string;
  name: string;
  code: string;
  region: string;
  commune: string;
  igp_certified?: boolean;
  total_members: number;
}

const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tableau', path: '/admin' },
  { icon: Store, label: 'Marchands', path: '/admin/marchands' },
  { icon: UserCog, label: 'Agents', path: '/admin/agents' },
  { icon: Wheat, label: 'Coopératives', path: '/admin/cooperatives' },
  { icon: Users, label: 'Utilisateurs', path: '/admin/utilisateurs' },
];

const AdminCooperatives: React.FC = () => {
  const navigate = useNavigate();
  
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [certificationFilter, setCertificationFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  useEffect(() => {
    const fetchCooperatives = async () => {
      const { data } = await supabase
        .from('cooperatives')
        .select('*')
        .order('name');

      if (data) {
        setCooperatives(data);
      }

      setIsLoading(false);
    };

    fetchCooperatives();
  }, []);

  // Get unique regions for filter
  const regions = [...new Set(cooperatives.map(c => c.region))];

  const filteredCooperatives = cooperatives.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.commune.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCertification = certificationFilter === 'all' || 
      (certificationFilter === 'certified' && c.igp_certified) || 
      (certificationFilter === 'not_certified' && !c.igp_certified);
    
    const matchesRegion = regionFilter === 'all' || c.region === regionFilter;
    
    return matchesSearch && matchesCertification && matchesRegion;
  });

  const certificationOptions = [
    { value: 'all', label: 'Toutes', count: cooperatives.length },
    { value: 'certified', label: 'Certifiées IFN', count: cooperatives.filter(c => c.igp_certified).length },
    { value: 'not_certified', label: 'Non certifiées', count: cooperatives.filter(c => !c.igp_certified).length },
  ];

  const regionOptions = [
    { value: 'all', label: 'Toutes régions' },
    ...regions.map(region => ({ value: region, label: region }))
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Chargement des coopératives..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <UnifiedHeader
        title="Coopératives"
        showBack
        backTo="/admin"
      />

      <PageHero
        title="Coopératives agricoles"
        subtitle="Réseau de coopératives partenaires"
        count={cooperatives.length}
        countLabel="coopératives"
        icon={Wheat}
        variant="accent"
      >
        <FilterChips
          options={certificationOptions}
          value={certificationFilter}
          onChange={setCertificationFilter}
        />
        {regions.length > 1 && (
          <div className="mt-2">
            <FilterChips
              options={regionOptions}
              value={regionFilter}
              onChange={setRegionFilter}
            />
          </div>
        )}
      </PageHero>

      <div className="p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une coopérative..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* Cooperatives list */}
        {filteredCooperatives.length === 0 ? (
          <EmptyState
            Icon={Wheat}
            title="Aucune coopérative trouvée"
            message={searchQuery ? 'Essayez avec d\'autres termes de recherche' : undefined}
            variant="card"
          />
        ) : (
          <div className="space-y-3">
            {filteredCooperatives.map((coop) => (
              <UnifiedListCard
                key={coop.id}
                entityType="cooperative"
                title={coop.name}
                subtitle={coop.code}
                avatar="🌾"
                status={coop.igp_certified ? 'validated' : undefined}
                statusLabel={coop.igp_certified ? 'IFN' : undefined}
                metadata={[
                  { 
                    icon: MapPin, 
                    text: `${coop.commune}, ${coop.region}` 
                  },
                  { 
                    icon: Users, 
                    text: `${coop.total_members} membres` 
                  },
                ]}
                description={coop.igp_certified ? (
                  "Certification IFN"
                ) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <UnifiedBottomNav items={adminNavItems} />
    </div>
  );
};

export default AdminCooperatives;
