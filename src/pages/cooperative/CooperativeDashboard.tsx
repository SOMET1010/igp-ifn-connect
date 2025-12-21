import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { AudioButton } from '@/components/shared/AudioButton';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  LogOut,
  Home,
  ClipboardList,
  User,
  Award,
  Loader2
} from 'lucide-react';

const BottomNav: React.FC<{ t: (key: string) => string }> = ({ t }) => {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: t("home"), path: '/cooperative' },
    { icon: Package, label: t("stock"), path: '/cooperative/stock' },
    { icon: ClipboardList, label: t("orders"), path: '/cooperative/commandes' },
    { icon: User, label: t("profile"), path: '/cooperative/profil' },
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
  region: string;
  commune: string;
  ifn_certified?: boolean;
  total_members: number;
}

interface Stats {
  products: number;
  pendingOrders: number;
}

const CooperativeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  
  const [cooperative, setCooperative] = useState<CooperativeData | null>(null);
  const [stats, setStats] = useState<Stats>({ products: 0, pendingOrders: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch cooperative data
      const { data: coopData } = await supabase
        .from('cooperatives')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (coopData) {
        setCooperative(coopData);

        // Fetch stock count
        const { count: stockCount } = await supabase
          .from('stocks')
          .select('*', { count: 'exact', head: true })
          .eq('cooperative_id', coopData.id);

        // Fetch pending orders count
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('cooperative_id', coopData.id)
          .eq('status', 'pending');

        setStats({
          products: stockCount ?? 0,
          pendingOrders: ordersCount ?? 0
        });
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/cooperative/login');
  };

  // Audio text dynamique
  const audioText = `${t("audio_coop_dashboard")} ${cooperative?.total_members ?? 0} ${t("members")}, ${stats.products} ${t("products")}, ${stats.pendingOrders} ${t("pending_orders")}.`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* AudioButton flottant */}
      <AudioButton 
        textToRead={audioText}
        variant="floating"
        size="lg"
        className="bottom-24 right-4 z-50"
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌾</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">{cooperative?.name ?? t("cooperative")}</h1>
                {cooperative?.ifn_certified && (
                  <Badge className="bg-yellow-400 text-yellow-900 text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    IFN
                  </Badge>
                )}
              </div>
              <p className="text-sm text-white/80">
                {cooperative?.commune}, {cooperative?.region}
              </p>
            </div>
          </div>
          <button onClick={handleSignOut} className="p-2 rounded-full hover:bg-white/10">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="w-10 h-10 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-amber-700" />
              </div>
              <p className="text-2xl font-bold text-foreground">{cooperative?.total_members ?? 0}</p>
              <p className="text-xs text-muted-foreground">{t("members")}</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="w-10 h-10 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Package className="h-5 w-5 text-green-700" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.products}</p>
              <p className="text-xs text-muted-foreground">{t("products")}</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="w-10 h-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <ShoppingCart className="h-5 w-5 text-blue-700" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.pendingOrders}</p>
              <p className="text-xs text-muted-foreground">{t("pending")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending orders alert */}
        {stats.pendingOrders > 0 && (
          <Card className="border-2 border-amber-300 bg-amber-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">📋</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {stats.pendingOrders} {t("pending_orders")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("to_confirm_or_process")}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/cooperative/commandes')}
                className="border-amber-500 text-amber-700 hover:bg-amber-100"
              >
                {t("view")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Action button */}
        <Button
          onClick={() => navigate('/cooperative/stock')}
          className="btn-xxl w-full bg-amber-600 hover:bg-amber-700"
        >
          <Package className="h-6 w-6" />
          {t("manage_my_stock")}
        </Button>

        {/* Navigation cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/cooperative/stock')}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Package className="h-7 w-7 text-green-700" />
              </div>
              <h3 className="font-semibold text-foreground">{t("my_stock")}</h3>
              <p className="text-sm text-muted-foreground">{stats.products} {t("products")}</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/cooperative/commandes')}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <ClipboardList className="h-7 w-7 text-blue-700" />
              </div>
              <h3 className="font-semibold text-foreground">{t("orders")}</h3>
              <p className="text-sm text-muted-foreground">{t("manage_requests")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick guide */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span>📋</span> {t("quick_guide")}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-amber-600">1.</span>
                <span>{t("guide_coop_1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">2.</span>
                <span>{t("guide_coop_2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">3.</span>
                <span>{t("guide_coop_3")}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <BottomNav t={t} />
    </div>
  );
};

export default CooperativeDashboard;