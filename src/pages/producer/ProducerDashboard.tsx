/**
 * Dashboard Producteur - PNAVIM
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { 
  Sprout, 
  Package, 
  ShoppingCart, 
  User, 
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

  const navItems = [
    { icon: Sprout, label: 'Accueil', path: '/producteur', isActive: true },
    { icon: Package, label: 'Récoltes', path: '/producteur/recoltes' },
    { icon: ShoppingCart, label: 'Commandes', path: '/producteur/commandes' },
    { icon: User, label: 'Profil', path: '/producteur/profil' },
  ];

  if (isLoading) {
    return (
      <MobileLayout title="Producteur" navItems={navItems}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  const recentHarvests = harvests.slice(0, 2);
  const recentOrders = pendingOrders.slice(0, 2);

  return (
    <MobileLayout title="Producteur" navItems={navItems}>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 -mx-4 -mt-4 px-4 py-6 text-white">
          <h1 className="text-xl font-bold">
            Bonjour, {producer?.full_name?.split(' ')[0] || 'Producteur'} 👋
          </h1>
          <p className="text-emerald-100 text-sm mt-1">
            {producer?.cooperative?.name || 'Producteur indépendant'}
          </p>
        </div>

        {/* Stats */}
        <ProducerStats stats={stats} isLoading={isStatsLoading} />

        {/* Quick Action */}
        <Link to="/producteur/recoltes">
          <Button className="w-full gap-2 h-12">
            <Plus className="h-5 w-5" />
            Publier une nouvelle récolte
          </Button>
        </Link>

        {/* Recent Harvests */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Mes récoltes
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
                <p className="text-sm">Aucune récolte publiée</p>
                <Link to="/producteur/recoltes">
                  <Button variant="link" size="sm">Publier maintenant</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Commandes en cours
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
                <p className="text-sm">Aucune commande en cours</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default ProducerDashboard;
