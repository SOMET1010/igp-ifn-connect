import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useAdminDashboard, 
  AdminStats, 
  EnrollmentChart, 
  NavigationCards, 
  AdvancedToolsGrid 
} from '@/features/admin';
import { EnhancedHeader } from '@/components/shared/EnhancedHeader';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { DashboardSkeleton } from '@/components/admin/DashboardSkeleton';
import { ErrorState } from '@/components/shared/StateComponents';
import { TestNotificationButton } from '@/components/admin/TestNotificationButton';
import { Home, Activity, BarChart3, Map as MapIcon } from 'lucide-react';

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
      <ErrorState
        fullScreen
        title="Erreur de chargement"
        message="Impossible de charger les données du tableau de bord."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <EnhancedHeader
        title="Administration IFN"
        subtitle="Direction Générale des Entreprises"
        showSignOut
        onSignOut={handleSignOut}
      />

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Bouton de test pour les notifications Realtime */}
        <div className="flex justify-end">
          <TestNotificationButton />
        </div>
        
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
