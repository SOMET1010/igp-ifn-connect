/**
 * Dashboard Producteur - PNAVIM
 * Refonte Jùlaba Design System
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import {
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaButton,
  JulabaListItem,
  JulabaStatCard,
  JulabaBottomNav,
  JulabaEmptyState,
  type JulabaNavItem,
} from '@/shared/ui/julaba';
import { 
  useProducerData, 
  useProducerHarvests, 
  useProducerOrders,
  ProducerStats,
  HarvestCard,
  OrderCard
} from '@/features/producer';

// Nav items Producteur
const PRODUCER_NAV_ITEMS: JulabaNavItem[] = [
  { emoji: '🌾', label: 'Accueil', path: '/producteur' },
  { emoji: '📦', label: 'Récoltes', path: '/producteur/recoltes' },
  { emoji: '🛒', label: 'Commandes', path: '/producteur/commandes' },
  { emoji: '👤', label: 'Profil', path: '/producteur/profil' },
];

const ProducerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { producer, stats, isLoading, isStatsLoading } = useProducerData();
  const { harvests, isLoading: isHarvestsLoading } = useProducerHarvests(producer?.id);
  const { pendingOrders, isLoading: isOrdersLoading } = useProducerOrders(producer?.id);

  const recentHarvests = harvests.slice(0, 2);
  const recentOrders = pendingOrders.slice(0, 2);

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
      {/* Header avec gradient custom */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-6 text-white rounded-b-3xl mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🌾</span>
          <div>
            <h1 className="text-xl font-bold">Mon champ</h1>
            <p className="text-emerald-100 text-sm">
              Bonjour, {producer?.full_name?.split(' ')[0] || 'Producteur'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            📊 Mes statistiques
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <JulabaStatCard
              label="Récoltes"
              value={stats.totalHarvests}
              emoji="🌿"
              iconBg="green"
            />
            <JulabaStatCard
              label="Disponibles"
              value={stats.availableHarvests}
              emoji="✅"
              iconBg="blue"
            />
            <JulabaStatCard
              label="Commandes"
              value={stats.totalOrders}
              emoji="📋"
              iconBg="orange"
            />
            <JulabaStatCard
              label="Revenu"
              value={stats.totalRevenue}
              emoji="💰"
              iconBg="gold"
              suffix="FCFA"
            />
          </div>
        </section>

        {/* Action principale XXL */}
        <JulabaButton
          variant="hero"
          emoji="🌿"
          onClick={() => navigate('/producteur/recoltes')}
          className="w-full"
        >
          DÉCLARER MA RÉCOLTE
        </JulabaButton>

        {/* Ce que j'ai récolté */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-medium text-muted-foreground">
              🌿 Ce que j'ai récolté
            </h2>
            <button 
              onClick={() => navigate('/producteur/recoltes')}
              className="text-xs text-primary font-medium"
            >
              Voir tout →
            </button>
          </div>
          
          {isHarvestsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentHarvests.length > 0 ? (
            <div className="space-y-2">
              {recentHarvests.map((harvest) => (
                <JulabaCard key={harvest.id} className="p-3">
                  <HarvestCard harvest={harvest} />
                </JulabaCard>
              ))}
            </div>
          ) : (
            <JulabaEmptyState
              emoji="🌱"
              title="Pas encore de récolte"
              description="Déclarez votre première récolte"
            />
          )}
        </section>

        {/* Ce qu'on me demande */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-medium text-muted-foreground">
              🛒 Ce qu'on me demande
            </h2>
            <button 
              onClick={() => navigate('/producteur/commandes')}
              className="text-xs text-primary font-medium"
            >
              Voir tout →
            </button>
          </div>
          
          {isOrdersLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <JulabaCard key={order.id} className="p-3">
                  <OrderCard order={order} />
                </JulabaCard>
              ))}
            </div>
          ) : (
            <JulabaEmptyState
              emoji="📭"
              title="Pas de demande"
              description="Les coopératives verront bientôt vos récoltes"
            />
          )}
        </section>

        {/* Actions rapides */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground px-1">
            🎯 Actions rapides
          </h2>
          <div className="space-y-2">
            <JulabaListItem
              emoji="📦"
              title="Mes récoltes"
              subtitle="Gérer mes produits"
              onClick={() => navigate('/producteur/recoltes')}
            />
            <JulabaListItem
              emoji="🛒"
              title="Mes commandes"
              subtitle="Voir les demandes"
              badge={pendingOrders.length > 0 ? {
                text: String(pendingOrders.length),
                variant: 'warning'
              } : undefined}
              onClick={() => navigate('/producteur/commandes')}
            />
            <JulabaListItem
              emoji="👤"
              title="Mon profil"
              subtitle="Mes informations"
              onClick={() => navigate('/producteur/profil')}
            />
          </div>
        </section>
      </div>

      <JulabaBottomNav items={PRODUCER_NAV_ITEMS} />
    </JulabaPageLayout>
  );
};

export default ProducerDashboard;
