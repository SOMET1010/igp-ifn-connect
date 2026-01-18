/**
 * MerchantList - Liste des marchands enrôlés par l'agent
 * Refonte Jùlaba Design System
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/shared/contexts';
import { Loader2 } from 'lucide-react';
import {
  JulabaPageLayout,
  JulabaHeader,
  JulabaListItem,
  JulabaStatCard,
  JulabaTabBar,
  JulabaBottomNav,
  JulabaEmptyState,
  JulabaInput,
  type JulabaNavItem,
} from '@/shared/ui/julaba';
import type { Database } from '@/integrations/supabase/types';

type Merchant = Database['public']['Tables']['merchants']['Row'];
type MerchantStatus = Database['public']['Enums']['merchant_status'];

// Nav items Agent
const AGENT_NAV_ITEMS: JulabaNavItem[] = [
  { emoji: '🏠', label: 'Accueil', path: '/agent' },
  { emoji: '✍️', label: 'Inscrire', path: '/agent/enrolement' },
  { emoji: '👥', label: 'Marchands', path: '/agent/marchands' },
  { emoji: '👤', label: 'Profil', path: '/agent/profil' },
];

const STATUS_TABS = [
  { id: 'all', label: 'Tous', emoji: '📋' },
  { id: 'pending', label: 'En attente', emoji: '⏳' },
  { id: 'validated', label: 'Validés', emoji: '✅' },
  { id: 'rejected', label: 'Rejetés', emoji: '❌' },
];

const statusEmoji: Record<MerchantStatus, string> = {
  pending: '⏳',
  validated: '✅',
  rejected: '❌',
  suspended: '⛔',
};

const MerchantList: React.FC = () => {
  const { user } = useAuth();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
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

  // Filtrage
  const filteredMerchants = merchants.filter(m => {
    // Filtre statut
    if (statusFilter !== 'all' && m.status !== statusFilter) {
      return false;
    }
    // Filtre recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        m.full_name.toLowerCase().includes(query) ||
        m.cmu_number.toLowerCase().includes(query) ||
        m.phone.includes(query) ||
        m.activity_type.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Compteurs
  const countByStatus = {
    all: merchants.length,
    pending: merchants.filter(m => m.status === 'pending').length,
    validated: merchants.filter(m => m.status === 'validated').length,
    rejected: merchants.filter(m => m.status === 'rejected').length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (isLoading) {
    return (
      <JulabaPageLayout background="gradient">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="gradient">
      <JulabaHeader
        title="Mes Marchands"
        subtitle={`${merchants.length} enrôlé(s)`}
        showBack
        backPath="/agent"
      />

      <div className="p-4 space-y-4">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-2">
          <JulabaStatCard
            label="En attente"
            value={countByStatus.pending}
            emoji="⏳"
            iconBg="orange"
          />
          <JulabaStatCard
            label="Validés"
            value={countByStatus.validated}
            emoji="✅"
            iconBg="green"
          />
          <JulabaStatCard
            label="Rejetés"
            value={countByStatus.rejected}
            emoji="❌"
            iconBg="purple"
          />
        </div>

        {/* Filtres par statut */}
        <JulabaTabBar
          tabs={STATUS_TABS.map(t => ({
            ...t,
            label: `${t.label} (${countByStatus[t.id as keyof typeof countByStatus] || 0})`,
          }))}
          activeTab={statusFilter}
          onTabChange={setStatusFilter}
        />

        {/* Recherche */}
        <JulabaInput
          placeholder="🔍 Rechercher par nom, CMU, téléphone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Liste */}
        {filteredMerchants.length === 0 ? (
          <JulabaEmptyState
            emoji={searchQuery || statusFilter !== 'all' ? '🔍' : '👥'}
            title={searchQuery || statusFilter !== 'all' ? 'Aucun résultat' : 'Aucun marchand'}
            description={
              searchQuery || statusFilter !== 'all'
                ? 'Essayez avec d\'autres critères'
                : 'Commencez par enrôler votre premier marchand'
            }
          />
        ) : (
          <div className="space-y-2">
            {filteredMerchants.map((merchant) => (
              <JulabaListItem
                key={merchant.id}
                emoji={statusEmoji[merchant.status ?? 'pending']}
                title={merchant.full_name}
                subtitle={`${merchant.activity_type} • ${merchant.phone}`}
                value={formatDate(merchant.enrolled_at)}
                showChevron={false}
              />
            ))}
          </div>
        )}
      </div>

      <JulabaBottomNav items={AGENT_NAV_ITEMS} />
    </JulabaPageLayout>
  );
};

export default MerchantList;
