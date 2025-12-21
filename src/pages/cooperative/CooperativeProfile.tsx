import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { 
  Package, 
  ArrowLeft,
  Home,
  ClipboardList,
  User,
  Loader2,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Award,
  Users,
  Hash
} from 'lucide-react';
import { NotificationToggle } from '@/components/shared/NotificationToggle';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: 'Accueil', path: '/cooperative' },
    { icon: Package, label: 'Stock', path: '/cooperative/stock' },
    { icon: ClipboardList, label: 'Commandes', path: '/cooperative/commandes' },
    { icon: User, label: 'Profil', path: '/cooperative/profil' },
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
                  ? "text-amber-700 bg-amber-100" 
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
        <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/cooperative')} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Profil Coopérative</h1>
            <p className="text-sm text-white/80">Informations et paramètres</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Profile header */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-4xl">🌾</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {cooperative?.name}
            </h2>
            {cooperative?.ifn_certified && (
              <Badge className="bg-yellow-400 text-yellow-900 mb-2">
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
        <Card className={cooperative?.ifn_certified ? 'border-2 border-yellow-400' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                cooperative?.ifn_certified ? 'bg-yellow-100' : 'bg-muted'
              }`}>
                <Award className={`h-6 w-6 ${
                  cooperative?.ifn_certified ? 'text-yellow-600' : 'text-muted-foreground'
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
          className="w-full border-red-300 text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Se déconnecter
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-4">
          Plateforme IFN - © 2024
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default CooperativeProfile;
