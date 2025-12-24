import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useAdminDashboard, 
  AdminStats, 
  EnrollmentChart, 
  NavigationCards, 
  AdvancedToolsGrid 
} from '@/features/admin';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { DashboardSkeleton } from '@/components/admin/DashboardSkeleton';
import { Home, Activity, BarChart3, Map as MapIcon, AlertCircle, RefreshCw } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { stats, chartData, isLoading, error, refetch } = useAdminDashboard();

  const navItems = useMemo(() => [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: Activity, label: 'Monitoring', path: '/admin/monitoring' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: MapIcon, label: 'Carte', path: '/admin/carte' },
  ], []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Erreur de chargement</h2>
        <p className="text-muted-foreground text-center mb-4">
          Impossible de charger les données du tableau de bord.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <UnifiedHeader
        title="Administration IFN"
        subtitle="Direction Générale des Entreprises"
        showSignOut
        onSignOut={handleSignOut}
      />

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        <AdminStats stats={stats} />
        <EnrollmentChart chartData={chartData} />
        <NavigationCards stats={stats} onNavigate={navigate} />
        <AdvancedToolsGrid onNavigate={navigate} />
      </div>

      <UnifiedBottomNav items={navItems} />
    </div>
  );
};

export default AdminDashboard;
