import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useAdminDashboard, 
  AdminStats, 
  EnrollmentChart, 
  NavigationCards, 
  AdvancedToolsGrid 
} from '@/features/admin';
import { RoleLayout } from '@/app/layouts/RoleLayout';
import { TestNotificationButton } from '@/components/admin/TestNotificationButton';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats, chartData, isLoading, error, refetch } = useAdminDashboard();

  return (
    <RoleLayout
      title="Administration IFN"
      subtitle="Direction Générale des Entreprises"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      showSignOut
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Bouton de test pour les notifications Realtime */}
        <div className="flex justify-end">
          <TestNotificationButton />
        </div>
        
        <AdminStats stats={stats} />
        <EnrollmentChart chartData={chartData} />
        <NavigationCards stats={stats} onNavigate={navigate} />
        <AdvancedToolsGrid onNavigate={navigate} />
      </div>
    </RoleLayout>
  );
};

export default AdminDashboard;
