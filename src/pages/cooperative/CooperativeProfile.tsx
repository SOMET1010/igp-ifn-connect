import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Award,
  Users,
  Hash,
  User
} from 'lucide-react';
import { NotificationToggle } from '@/components/shared/NotificationToggle';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { cooperativeNavItems } from '@/config/navigation';

interface CooperativeData {
  id: string;
  name: string;
  code: string;
  region: string;
  commune: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  ifn_certified?: boolean;
  total_members: number;
}

const CooperativeProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [cooperative, setCooperative] = useState<CooperativeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: coopData } = await supabase
        .from('cooperatives')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (coopData) {
        setCooperative(coopData);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/cooperative/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <UnifiedHeader
        title="Profil Coopérative"
        subtitle="Informations et paramètres"
        showBack
        backTo="/cooperative"
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Profile header */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-4xl">🌾</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {cooperative?.name}
            </h2>
            {cooperative?.ifn_certified && (
              <Badge className="bg-primary/20 text-primary mb-2">
                <Award className="w-4 h-4 mr-1" />
                Certifié IFN
              </Badge>
            )}
            <p className="text-muted-foreground">
              {cooperative?.commune}, {cooperative?.region}
            </p>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span>📋</span> Informations
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Code coopérative</p>
                  <p className="font-medium text-foreground">{cooperative?.code}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Localisation</p>
                  <p className="font-medium text-foreground">
                    {cooperative?.address || `${cooperative?.commune}, ${cooperative?.region}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nombre de membres</p>
                  <p className="font-medium text-foreground">{cooperative?.total_members ?? 0} membres</p>
                </div>
              </div>

              {cooperative?.phone && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium text-foreground">+225 {cooperative.phone}</p>
                  </div>
                </div>
              )}

              {cooperative?.email && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{cooperative.email}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* IFN Status */}
        <Card className={cooperative?.ifn_certified ? 'border-2 border-primary/50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                cooperative?.ifn_certified ? 'bg-primary/10' : 'bg-muted'
              }`}>
                <Award className={`h-6 w-6 ${
                  cooperative?.ifn_certified ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Certification IFN
                </h3>
                <p className="text-sm text-muted-foreground">
                  {cooperative?.ifn_certified 
                    ? 'Votre coopérative est certifiée IFN' 
                    : 'Non certifié - Contactez la DGE pour la certification'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Notifications</h3>
            <NotificationToggle className="w-full" />
          </CardContent>
        </Card>

        {/* Logout button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Se déconnecter
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-4">
          Plateforme IFN - © 2024
        </p>
      </div>

      <UnifiedBottomNav items={cooperativeNavItems} />
    </div>
  );
};

export default CooperativeProfile;