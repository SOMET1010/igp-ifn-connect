/**
 * Page Profil du Producteur - PNAVIM
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { 
  Sprout, 
  Package, 
  ShoppingCart, 
  User, 
  Loader2,
  Phone,
  MapPin,
  Building2,
  Award,
  Calendar
} from 'lucide-react';
import { useProducerData, ProducerStats } from '@/features/producer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProducerProfile: React.FC = () => {
  const { producer, stats, isLoading, isStatsLoading } = useProducerData();

  const navItems = [
    { icon: Sprout, label: 'Accueil', path: '/producteur' },
    { icon: Package, label: 'Récoltes', path: '/producteur/recoltes' },
    { icon: ShoppingCart, label: 'Commandes', path: '/producteur/commandes' },
    { icon: User, label: 'Profil', path: '/producteur/profil', isActive: true },
  ];

  if (isLoading) {
    return (
      <MobileLayout title="Mon Profil" navItems={navItems}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!producer) {
    return (
      <MobileLayout title="Mon Profil" navItems={navItems}>
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Profil non trouvé</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Mon Profil" navItems={navItems}>
      <div className="space-y-6 pb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 -mx-4 -mt-4 px-4 py-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{producer.full_name}</h1>
              <p className="text-emerald-100 text-sm">{producer.region}, {producer.commune}</p>
              <div className="flex gap-2 mt-2">
                {producer.igp_certified && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    <Award className="h-3 w-3 mr-1" />
                    IGP Certifié
                  </Badge>
                )}
                {producer.is_active && (
                  <Badge variant="secondary" className="bg-emerald-500 text-white border-0">
                    Actif
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Statistiques</h2>
          <ProducerStats stats={stats} isLoading={isStatsLoading} />
        </div>

        {/* Info Cards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{producer.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Localisation</p>
                <p className="font-medium">{producer.commune}, {producer.region}</p>
              </div>
            </div>

            {producer.cooperative && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coopérative</p>
                  <p className="font-medium">{producer.cooperative.name}</p>
                  <p className="text-xs text-muted-foreground">{producer.cooperative.code}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Membre depuis</p>
                <p className="font-medium">
                  {format(new Date(producer.created_at), 'MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specialties */}
        {producer.specialties && producer.specialties.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sprout className="h-4 w-4" />
                Spécialités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {producer.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
};

export default ProducerProfile;
