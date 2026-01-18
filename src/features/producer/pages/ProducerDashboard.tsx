/**
 * Dashboard Producteur - PNAVIM
 * Phase 6: Migré vers RoleLayout
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoleLayout } from '@/app/layouts/RoleLayout';
import { 
  Package, 
  ShoppingCart, 
  Plus,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { 
  useProducerData, 
  useProducerHarvests, 
  useProducerOrders,
  ProducerStats,
  HarvestCard,
  OrderCard
} from '@/features/producer';

const ProducerDashboard: React.FC = () => {
  const { producer, stats, isLoading, isStatsLoading } = useProducerData();
  const { harvests, isLoading: isHarvestsLoading } = useProducerHarvests(producer?.id);
  const { pendingOrders, isLoading: isOrdersLoading } = useProducerOrders(producer?.id);

  const recentHarvests = harvests.slice(0, 2);
  const recentOrders = pendingOrders.slice(0, 2);

  // Header personnalisé avec gradient
  const CustomHeader = () => (
    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 -mx-4 -mt-4 px-4 py-6 text-white rounded-b-xl">
      <h1 className="text-xl font-bold">
        Mon champ 🌾
      </h1>
      <p className="text-emerald-100 text-sm mt-1">
        Bonjour, {producer?.full_name?.split(' ')[0] || 'Producteur'}
      </p>
    </div>
  );

  return (
    <RoleLayout
      title="Mon champ"
      subtitle="Ce que je cultive"
      isLoading={isLoading}
      showSignOut
      showHeader={false}
    >
      <div className="space-y-6 pb-6">
        {/* Header gradient custom */}
        <CustomHeader />

        {/* Stats */}
        <ProducerStats stats={stats} isLoading={isStatsLoading} />

        {/* Action principale XXL */}
        <Link to="/producteur/recoltes">
          <Button className="w-full gap-2 h-16 text-lg font-bold rounded-2xl">
            <Plus className="h-6 w-6" />
            DÉCLARER MA RÉCOLTE
          </Button>
        </Link>

        {/* Ce que j'ai récolté */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Ce que j'ai récolté
              </CardTitle>
              <Link to="/producteur/recoltes" className="text-sm text-primary flex items-center gap-1">
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isHarvestsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentHarvests.length > 0 ? (
              recentHarvests.map((harvest) => (
                <HarvestCard key={harvest.id} harvest={harvest} />
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tu n'as pas encore déclaré de récolte</p>
                <Link to="/producteur/recoltes">
                  <Button variant="link" size="sm">Déclarer maintenant</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ce qu'on me demande */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Ce qu'on me demande
              </CardTitle>
              <Link to="/producteur/commandes" className="text-sm text-primary flex items-center gap-1">
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isOrdersLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Personne ne t'a encore demandé de produits</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleLayout>
  );
};

export default ProducerDashboard;
