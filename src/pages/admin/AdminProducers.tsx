/**
 * Admin Producers Page
 * Gestion des producteurs agricoles (CRUD complet)
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Leaf, 
  MapPin, 
  Phone, 
  Building2, 
  Plus,
  Pencil,
  Trash2,
  Eye,
  FileDown,
  Shield,
  Users
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
import { Badge } from '@/components/ui/badge';
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

interface Producer {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  region: string;
  commune: string;
  cooperative_id: string | null;
  igp_certified: boolean;
  is_active: boolean;
  specialties: string[] | null;
  created_at: string;
  cooperative?: { name: string } | null;
}

const AdminProducers: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [producerToDelete, setProducerToDelete] = useState<Producer | null>(null);

  // Fetch producers
  const { data: producers = [], isLoading } = useQuery({
    queryKey: ['admin-producers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('producers')
        .select(`
          *,
          cooperative:cooperatives(name)
        `)
        .order('full_name');
      
      if (error) throw error;
      return data as Producer[];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('producers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-producers'] });
      toast.success('Producteur supprimé');
      setDeleteDialogOpen(false);
      setProducerToDelete(null);
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  // Get unique regions
  const regions = [...new Set(producers.map(p => p.region).filter(Boolean))];

  // Filter producers
  const filteredProducers = producers.filter(p => {
    const matchesSearch = 
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery) ||
      p.commune?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && p.is_active) || 
      (statusFilter === 'inactive' && !p.is_active) ||
      (statusFilter === 'igp' && p.igp_certified);
    
    const matchesRegion = regionFilter === 'all' || p.region === regionFilter;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  // Stats
  const totalActive = producers.filter(p => p.is_active).length;
  const totalIgp = producers.filter(p => p.igp_certified).length;

  const statusFilterOptions = [
    { value: 'all', label: 'Tous', count: producers.length },
    { value: 'active', label: 'Actifs', count: totalActive },
    { value: 'igp', label: 'Certifiés IGP', count: totalIgp },
    { value: 'inactive', label: 'Inactifs', count: producers.length - totalActive },
  ];

  const regionFilterOptions = [
    { value: 'all', label: 'Toutes régions' },
    ...regions.map(r => ({ value: r, label: r }))
  ];

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(34, 139, 34);
    doc.text('Liste des Producteurs', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${filteredProducers.length} producteurs • Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 28, { align: 'center' });

    autoTable(doc, {
      startY: 38,
      head: [['Nom', 'Téléphone', 'Région', 'Commune', 'IGP', 'Statut']],
      body: filteredProducers.map(p => [
        p.full_name,
        p.phone || '-',
        p.region || '-',
        p.commune || '-',
        p.igp_certified ? 'Oui' : 'Non',
        p.is_active ? 'Actif' : 'Inactif',
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [34, 139, 34], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save('producteurs.pdf');
    toast.success('Export PDF généré');
  };

  // Export Excel (CSV)
  const exportExcel = () => {
    const headers = ['Nom', 'Téléphone', 'Région', 'Commune', 'Coopérative', 'IGP', 'Statut'];
    const rows = filteredProducers.map(p => [
      p.full_name,
      p.phone || '',
      p.region || '',
      p.commune || '',
      p.cooperative?.name || '',
      p.igp_certified ? 'Oui' : 'Non',
      p.is_active ? 'Actif' : 'Inactif',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'producteurs.csv';
    link.click();
    toast.success('Export Excel généré');
  };

  const handleDelete = (producer: Producer) => {
    setProducerToDelete(producer);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (producerToDelete) {
      deleteMutation.mutate(producerToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Chargement des producteurs..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <EnhancedHeader
        title="Producteurs"
        showBack
        backTo="/admin"
      />

      <PageHero
        title="Producteurs agricoles"
        subtitle="Gérez les producteurs partenaires"
        count={producers.length}
        countLabel="producteurs"
        icon={Leaf}
        variant="secondary"
      >
        <div className="flex items-center gap-2 mb-2">
          <Button
            size="sm"
            onClick={() => navigate('/admin/producteurs/nouveau')}
            className="bg-secondary hover:bg-secondary/90"
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
        {regions.length > 1 && (
          <div className="mt-2">
            <FilterChips
              options={regionFilterOptions}
              value={regionFilter}
              onChange={setRegionFilter}
            />
          </div>
        )}
      </PageHero>

      <div className="p-4 space-y-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher un producteur..."
        />

        {/* Stats badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">
            <Users className="w-3 h-3 mr-1" />
            {totalActive} actifs
          </Badge>
          <Badge variant="outline" className="border-green-500 text-green-600">
            <Shield className="w-3 h-3 mr-1" />
            {totalIgp} certifiés IGP
          </Badge>
        </div>

        {filteredProducers.length === 0 ? (
          <EmptyState
            Icon={Leaf}
            title="Aucun producteur trouvé"
            message={searchQuery ? 'Essayez avec d\'autres termes' : 'Ajoutez votre premier producteur'}
            variant="card"
          />
        ) : (
          <AnimatedList className="space-y-3">
            {filteredProducers.map((producer) => (
              <AnimatedListItem key={producer.id}>
                <UnifiedListCard
                  entityType="producer"
                  title={producer.full_name}
                  subtitle={producer.cooperative?.name || 'Indépendant'}
                  avatar={producer.full_name.charAt(0).toUpperCase()}
                  status={producer.is_active ? 'active' : 'inactive'}
                  metadata={[
                    { icon: Phone, text: producer.phone || '-' },
                    { icon: MapPin, text: `${producer.commune || ''}, ${producer.region || ''}`.replace(/^, |, $/g, '') || '-' },
                    ...(producer.igp_certified ? [{ icon: Shield, text: 'IGP' }] : []),
                  ]}
                  actions={
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/producteurs/${producer.id}`);
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
                          navigate(`/admin/producteurs/${producer.id}/modifier`);
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
                          handleDelete(producer);
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
            <AlertDialogTitle>Supprimer ce producteur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{producerToDelete?.full_name}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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

export default AdminProducers;
