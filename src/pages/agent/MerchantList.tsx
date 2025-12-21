import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Search, MapPin, Phone, Clock, Loader2, ArrowLeft, Home, Users, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Merchant = Database['public']['Tables']['merchants']['Row'];
type MerchantStatus = Database['public']['Enums']['merchant_status'];

const statusConfig: Record<MerchantStatus, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-warning/20 text-foreground border-warning' },
  validated: { label: 'Validé', className: 'bg-secondary/20 text-secondary border-secondary' },
  rejected: { label: 'Rejeté', className: 'bg-destructive/20 text-destructive border-destructive' },
  suspended: { label: 'Suspendu', className: 'bg-muted text-muted-foreground border-muted' },
};

// Bottom Nav component
const BottomNav: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: 'Accueil', path: '/agent' },
    { icon: Users, label: 'Marchands', path: '/agent/marchands' },
    { icon: User, label: 'Profil', path: '/agent/profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/agent')}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Mes Marchands</h1>
        </div>
      </header>

      {/* Search */}
      <div className="p-4 sticky top-14 bg-background z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, CMU, téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input-lg pl-12"
          />
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'Aucun résultat' : 'Aucun marchand'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Essayez une autre recherche'
                : 'Commencez par enrôler votre premier marchand'}
            </p>
          </div>
        ) : (
          filteredMerchants.map((merchant) => (
            <Card key={merchant.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{merchant.full_name}</h3>
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
                    <span className="font-mono bg-muted px-2 py-0.5 rounded">
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

      <BottomNav />
    </div>
  );
};

export default MerchantList;
