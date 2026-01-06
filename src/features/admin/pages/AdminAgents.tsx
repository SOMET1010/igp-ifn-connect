import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  UserCog, 
  MapPin, 
  Users, 
  Building2, 
  Plus,
  Pencil,
  Trash2,
  Eye,
  FileDown
} from 'lucide-react';
import { EnhancedHeader } from '@/components/shared/EnhancedHeader';
import { PageHero } from '@/components/shared/PageHero';
import { FilterChips } from '@/components/shared/FilterChips';
import { UnifiedListCard } from '@/components/shared/UnifiedListCard';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { LoadingState, EmptyState } from '@/components/shared/StateComponents';
import { AnimatedList } from '@/components/shared/AnimatedList';
import { AnimatedListItem } from '@/components/shared/AnimatedListItem';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { adminNavItems } from '@/config/navigation';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Agent {
  id: string;
  user_id: string;
  employee_id: string;
  organization: string;
  zone: string | null;
  total_enrollments: number;
  is_active: boolean;
  full_name?: string;
}

const AdminAgents: React.FC = () => {
  const navigate = useNavigate();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  const fetchAgents = async () => {
    const { data: agentsData } = await supabase
      .from('agents')
      .select('*')
      .order('total_enrollments', { ascending: false });

    if (agentsData) {
      const userIds = agentsData.map(a => a.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const enrichedAgents = agentsData.map(agent => ({
        ...agent,
        full_name: profiles?.find(p => p.user_id === agent.user_id)?.full_name ?? 'Agent'
      }));

      setAgents(enrichedAgents);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Delete agent
  const handleDelete = async () => {
    if (!agentToDelete) return;
    
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', agentToDelete.id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Agent supprimé');
      fetchAgents();
    }
    
    setDeleteDialogOpen(false);
    setAgentToDelete(null);
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(0, 100, 0);
    doc.text('Liste des Agents', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${filteredAgents.length} agents • Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 28, { align: 'center' });

    autoTable(doc, {
      startY: 38,
      head: [['Nom', 'Matricule', 'Organisation', 'Zone', 'Enrôlements', 'Statut']],
      body: filteredAgents.map(a => [
        a.full_name || 'Agent',
        a.employee_id,
        a.organization,
        a.zone || '-',
        a.total_enrollments.toString(),
        a.is_active ? 'Actif' : 'Inactif',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 100, 0], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save('agents.pdf');
    toast.success('Export PDF généré');
  };

  // Export Excel
  const exportExcel = () => {
    const headers = ['Nom', 'Matricule', 'Organisation', 'Zone', 'Enrôlements', 'Statut'];
    const rows = filteredAgents.map(a => [
      a.full_name || 'Agent',
      a.employee_id,
      a.organization,
      a.zone || '',
      a.total_enrollments.toString(),
      a.is_active ? 'Actif' : 'Inactif',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'agents.csv';
    link.click();
    toast.success('Export Excel généré');
  };

  // Get unique organizations for filter
  const organizations = [...new Set(agents.map(a => a.organization))];

  const filteredAgents = agents.filter(a => {
    const matchesSearch = 
      a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.zone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && a.is_active) || 
      (statusFilter === 'inactive' && !a.is_active);
    
    const matchesOrg = orgFilter === 'all' || a.organization === orgFilter;
    
    return matchesSearch && matchesStatus && matchesOrg;
  });

  const statusFilterOptions = [
    { value: 'all', label: 'Tous', count: agents.length },
    { value: 'active', label: 'Actifs', count: agents.filter(a => a.is_active).length },
    { value: 'inactive', label: 'Inactifs', count: agents.filter(a => !a.is_active).length },
  ];

  const orgFilterOptions = [
    { value: 'all', label: 'Toutes orgs' },
    ...organizations.map(org => ({ value: org, label: org }))
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Chargement des agents..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <EnhancedHeader
        title="Agents"
        showBack
        backTo="/admin"
      />

      <PageHero
        title="Agents de terrain"
        subtitle="Gérez vos agents d'enrôlement"
        count={agents.length}
        countLabel="agents"
        icon={UserCog}
        variant="primary"
      >
        <div className="flex items-center gap-2 mb-2">
          <Button
            size="sm"
            onClick={() => navigate('/admin/agents/nouveau')}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <FileDown className="w-4 h-4 mr-1" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportPDF}>
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportExcel}>
                Export Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <FilterChips
          options={statusFilterOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        {organizations.length > 1 && (
          <div className="mt-2">
            <FilterChips
              options={orgFilterOptions}
              value={orgFilter}
              onChange={setOrgFilter}
            />
          </div>
        )}
      </PageHero>

      <div className="p-4 space-y-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher un agent..."
        />

        {filteredAgents.length === 0 ? (
          <EmptyState
            Icon={UserCog}
            title="Aucun agent trouvé"
            message={searchQuery ? 'Essayez avec d\'autres termes de recherche' : undefined}
            variant="card"
          />
        ) : (
          <AnimatedList className="space-y-3">
            {filteredAgents.map((agent) => (
              <AnimatedListItem key={agent.id}>
                <UnifiedListCard
                  entityType="agent"
                  title={agent.full_name || 'Agent'}
                  subtitle={agent.organization}
                  avatar={agent.full_name?.charAt(0).toUpperCase()}
                  status={agent.is_active ? 'active' : 'inactive'}
                  metadata={[
                    { icon: Building2, text: agent.employee_id },
                    { icon: Users, text: `${agent.total_enrollments} enrôlements` },
                    ...(agent.zone ? [{ icon: MapPin, text: agent.zone }] : [])
                  ]}
                  actions={
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/agents/${agent.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/agents/${agent.id}/modifier`);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAgentToDelete(agent);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  }
                />
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet agent ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{agentToDelete?.full_name}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UnifiedBottomNav items={adminNavItems} />
    </div>
  );
};

export default AdminAgents;
