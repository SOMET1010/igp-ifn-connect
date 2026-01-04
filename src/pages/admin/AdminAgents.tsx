import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserCog, MapPin, Users, Building2 } from 'lucide-react';
import { EnhancedHeader } from '@/components/shared/EnhancedHeader';
import { PageHero } from '@/components/shared/PageHero';
import { FilterChips } from '@/components/shared/FilterChips';
import { UnifiedListCard } from '@/components/shared/UnifiedListCard';
import { UnifiedBottomNav, NavItem } from '@/components/shared/UnifiedBottomNav';
import { LoadingState, EmptyState } from '@/components/shared/StateComponents';
import { AnimatedList } from '@/components/shared/AnimatedList';
import { AnimatedListItem } from '@/components/shared/AnimatedListItem';
import { SearchInput } from '@/components/shared/SearchInput';
import { LayoutDashboard, Store, Wheat } from 'lucide-react';

interface Agent {
  id: string;
  user_id: string;
  employee_id: string;
  organization: string;
  zone: string | null;
  total_enrollments: number;
  is_active: boolean;
  full_name?: string;
}

const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tableau', path: '/admin' },
  { icon: Store, label: 'Marchands', path: '/admin/marchands' },
  { icon: UserCog, label: 'Agents', path: '/admin/agents' },
  { icon: Wheat, label: 'Coopératives', path: '/admin/cooperatives' },
  { icon: Users, label: 'Utilisateurs', path: '/admin/utilisateurs' },
];

const AdminAgents: React.FC = () => {
  const navigate = useNavigate();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');

  useEffect(() => {
    const fetchAgents = async () => {
      const { data: agentsData } = await supabase
        .from('agents')
        .select('*')
        .order('total_enrollments', { ascending: false });

      if (agentsData) {
        const userIds = agentsData.map(a => a.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        const enrichedAgents = agentsData.map(agent => ({
          ...agent,
          full_name: profiles?.find(p => p.user_id === agent.user_id)?.full_name ?? 'Agent'
        }));

        setAgents(enrichedAgents);
      }

      setIsLoading(false);
    };

    fetchAgents();
  }, []);

  // Get unique organizations for filter
  const organizations = [...new Set(agents.map(a => a.organization))];

  const filteredAgents = agents.filter(a => {
    const matchesSearch = 
      a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.zone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && a.is_active) || 
      (statusFilter === 'inactive' && !a.is_active);
    
    const matchesOrg = orgFilter === 'all' || a.organization === orgFilter;
    
    return matchesSearch && matchesStatus && matchesOrg;
  });

  const statusFilterOptions = [
    { value: 'all', label: 'Tous', count: agents.length },
    { value: 'active', label: 'Actifs', count: agents.filter(a => a.is_active).length },
    { value: 'inactive', label: 'Inactifs', count: agents.filter(a => !a.is_active).length },
  ];

  const orgFilterOptions = [
    { value: 'all', label: 'Toutes orgs' },
    ...organizations.map(org => ({ value: org, label: org }))
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Chargement des agents..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <EnhancedHeader
        title="Agents"
        showBack
        backTo="/admin"
      />

      <PageHero
        title="Agents de terrain"
        subtitle="Gérez vos agents d'enrôlement"
        count={agents.length}
        countLabel="agents"
        icon={UserCog}
        variant="primary"
      >
        <FilterChips
          options={statusFilterOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        {organizations.length > 1 && (
          <div className="mt-2">
            <FilterChips
              options={orgFilterOptions}
              value={orgFilter}
              onChange={setOrgFilter}
            />
          </div>
        )}
      </PageHero>

      <div className="p-4 space-y-3">
        {/* Search integrated */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher un agent..."
        />

        {/* Agents list */}
        {filteredAgents.length === 0 ? (
          <EmptyState
            Icon={UserCog}
            title="Aucun agent trouvé"
            message={searchQuery ? 'Essayez avec d\'autres termes de recherche' : undefined}
            variant="card"
          />
        ) : (
          <AnimatedList className="space-y-3">
            {filteredAgents.map((agent) => (
              <AnimatedListItem key={agent.id}>
                <UnifiedListCard
                  entityType="agent"
                  title={agent.full_name || 'Agent'}
                  subtitle={agent.organization}
                  avatar={agent.full_name?.charAt(0).toUpperCase()}
                  status={agent.is_active ? 'active' : 'inactive'}
                  metadata={[
                    { 
                      icon: Building2, 
                      text: agent.employee_id 
                    },
                    { 
                      icon: Users, 
                      text: `${agent.total_enrollments} enrôlements` 
                    },
                    ...(agent.zone ? [{ 
                      icon: MapPin, 
                      text: agent.zone 
                    }] : [])
                  ]}
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

export default AdminAgents;
