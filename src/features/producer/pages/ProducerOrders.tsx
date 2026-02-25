/**
 * Page Commandes du Producteur - JÙLABA
 * Refonte Jùlaba Design System
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaStatCard,
  JulabaTabBar,
  JulabaBottomNav,
  JulabaEmptyState,
  type JulabaNavItem,
} from '@/shared/ui/julaba';
import { 
  useProducerData, 
  useProducerOrders,
  OrderCard
} from '@/features/producer';

// Nav items Producteur
const PRODUCER_NAV_ITEMS: JulabaNavItem[] = [
  { emoji: '🌾', label: 'Accueil', path: '/producteur' },
  { emoji: '📦', label: 'Récoltes', path: '/producteur/recoltes' },
  { emoji: '🛒', label: 'Commandes', path: '/producteur/commandes' },
  { emoji: '👤', label: 'Profil', path: '/producteur/profil' },
];

const ORDER_TABS = [
  { id: 'pending', label: 'En cours', emoji: '⏳' },
  { id: 'completed', label: 'Terminées', emoji: '✅' },
];

const ProducerOrders: React.FC = () => {
  const { producer, isLoading: isProducerLoading } = useProducerData();
  const { 
    pendingOrders,
    completedOrders,
    isLoading, 
    updateStatus,
    isUpdating
  } = useProducerOrders(producer?.id);

  const [activeTab, setActiveTab] = useState('pending');

  const displayedOrders = activeTab === 'pending' ? pendingOrders : completedOrders;

  if (isProducerLoading) {
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
        title="Commandes"
        subtitle={`${pendingOrders.length + completedOrders.length} commande(s)`}
        showBack
        backPath="/producteur"
      />

      <div className="p-4 space-y-4">
        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-3">
          <JulabaStatCard
            label="En cours"
            value={pendingOrders.length}
            emoji="⏳"
            iconBg="orange"
          />
          <JulabaStatCard
            label="Terminées"
            value={completedOrders.length}
            emoji="✅"
            iconBg="green"
          />
        </div>

        {/* Tabs */}
        <JulabaTabBar
          tabs={ORDER_TABS.map(t => ({
            ...t,
            label: `${t.label} (${t.id === 'pending' ? pendingOrders.length : completedOrders.length})`,
          }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Liste */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : displayedOrders.length > 0 ? (
          <div className="space-y-3">
            {displayedOrders.map((order) => (
              <JulabaCard key={order.id} className="p-3">
                <OrderCard 
                  order={order}
                  onUpdateStatus={activeTab === 'pending' 
                    ? (orderId, status) => updateStatus({ orderId, status })
                    : undefined
                  }
                  isUpdating={isUpdating}
                />
              </JulabaCard>
            ))}
          </div>
        ) : (
          <JulabaEmptyState
            emoji={activeTab === 'pending' ? '📭' : '📜'}
            title={activeTab === 'pending' ? 'Aucune commande en cours' : 'Aucune commande terminée'}
            description={activeTab === 'pending' 
              ? 'Les nouvelles commandes apparaîtront ici' 
              : 'Les commandes terminées apparaîtront ici'
            }
          />
        )}
      </div>

      <JulabaBottomNav items={PRODUCER_NAV_ITEMS} />
    </JulabaPageLayout>
  );
};

export default ProducerOrders;
