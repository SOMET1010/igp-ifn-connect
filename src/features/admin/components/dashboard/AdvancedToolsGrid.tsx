import React from 'react';
import { 
  UserCog, 
  Activity, 
  BarChart3, 
  FileText, 
  Mic, 
  Leaf 
} from 'lucide-react';
import { UnifiedActionCard } from '@/shared/ui';

interface AdvancedToolsGridProps {
  onNavigate: (path: string) => void;
}

export const AdvancedToolsGrid: React.FC<AdvancedToolsGridProps> = ({ onNavigate }) => {
  return (
    <>
      <h3 className="font-semibold text-foreground mt-2">
        Outils avancés
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <UnifiedActionCard
          title="Utilisateurs"
          description="Rôles et liaisons"
          icon={UserCog}
          onClick={() => onNavigate('/admin/utilisateurs')}
        />
        <UnifiedActionCard
          title="Monitoring"
          description="Surveillance"
          icon={Activity}
          onClick={() => onNavigate('/admin/monitoring')}
        />
        <UnifiedActionCard
          title="Analytics"
          description="Statistiques"
          icon={BarChart3}
          onClick={() => onNavigate('/admin/analytics')}
        />
        <UnifiedActionCard
          title="Rapports"
          description="Export"
          icon={FileText}
          onClick={() => onNavigate('/admin/rapports')}
        />
        <UnifiedActionCard
          title="Studio Audio"
          description="Enregistrer"
          icon={Mic}
          onClick={() => onNavigate('/admin/studio')}
        />
        <UnifiedActionCard
          title="Vivriers"
          description="Import coopératives"
          icon={Leaf}
          onClick={() => onNavigate('/admin/vivriers')}
        />
      </div>
    </>
  );
};
