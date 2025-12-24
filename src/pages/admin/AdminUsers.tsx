import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { PageHero } from '@/components/shared/PageHero';
import { FilterChips } from '@/components/shared/FilterChips';
import { UnifiedListCard } from '@/components/shared/UnifiedListCard';
import { UnifiedBottomNav, NavItem } from '@/components/shared/UnifiedBottomNav';
import { DashboardSkeleton } from '@/components/admin/DashboardSkeleton';
import { AnimatedList } from '@/components/shared/AnimatedList';
import { AnimatedListItem } from '@/components/shared/AnimatedListItem';
import { SearchInput } from '@/components/shared/SearchInput';
import { useAdminUsersData, type AdminUserData, type ExpectedEntityType, type AppRole } from '@/features/admin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Store,
  UserCog,
  Wheat,
  Shield,
  Link,
  Unlink,
  Trash2,
  Wand2,
  Download,
  LayoutDashboard
} from 'lucide-react';
import { ErrorState } from '@/components/shared/StateComponents';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const roleConfig: Record<AppRole, { label: string; color: string; icon: React.ElementType }> = {
  admin: { label: 'Admin', color: 'bg-violet-500/10 text-violet-700 border-violet-500/30', icon: Shield },
  merchant: { label: 'Marchand', color: 'bg-secondary/10 text-secondary border-secondary/30', icon: Store },
  agent: { label: 'Agent', color: 'bg-primary/10 text-primary border-primary/30', icon: UserCog },
  cooperative: { label: 'Coopérative', color: 'bg-accent/10 text-accent border-accent/30', icon: Wheat },
  user: { label: 'Utilisateur', color: 'bg-muted text-muted-foreground border-muted', icon: Users },
};

const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tableau', path: '/admin' },
  { icon: Store, label: 'Marchands', path: '/admin/marchands' },
  { icon: UserCog, label: 'Agents', path: '/admin/agents' },
  { icon: Wheat, label: 'Coopératives', path: '/admin/cooperatives' },
  { icon: Users, label: 'Utilisateurs', path: '/admin/utilisateurs' },
];

// CSV Export function
const exportUsersToCSV = (users: AdminUserData[]) => {
  const headers = [
    'Nom complet',
    'Téléphone',
    'Rôles',
    "Type d'entité",
    "Nom de l'entité",
    'Statut entité',
    'Date création',
    'Lié'
  ];

  const rows = users.map(user => {
    let entityType = '-';
    let entityName = '-';
    let entityStatus = '-';

    if (user.linkedMerchant) {
      entityType = 'Marchand';
      entityName = user.linkedMerchant.full_name;
      entityStatus = user.linkedMerchant.status || '-';
    } else if (user.linkedAgent) {
      entityType = 'Agent';
      entityName = user.linkedAgent.employee_id;
      entityStatus = user.linkedAgent.is_active ? 'actif' : 'inactif';
    } else if (user.linkedCooperative) {
      entityType = 'Coopérative';
      entityName = user.linkedCooperative.name;
      entityStatus = 'active';
    }

    return [
      user.fullName,
      user.phone || '-',
      user.roles.join(', '),
      entityType,
      entityName,
      entityStatus,
      format(new Date(user.createdAt), 'dd/MM/yyyy'),
      user.hasLinkedEntity ? 'Oui' : 'Non'
    ];
  });

  const csvContent = '\uFEFF' + 
    [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `utilisateurs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.click();
  URL.revokeObjectURL(url);
};

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { users, stats, isLoading, error, filters, setFilters, refetch } = useAdminUsersData();
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [merchantDialogOpen, setMerchantDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Merchant form state
  const [merchantForm, setMerchantForm] = useState({
    fullName: '',
    phone: '',
    cmuNumber: '',
    activityType: 'vivrier'
  });

  const handleCreateAgent = async (user: AdminUserData) => {
    setIsProcessing(true);
    try {
      const phone = user.phone || `07${Math.random().toString().slice(2, 10)}`;
      
      const { error: agentError } = await supabase.from('agents').insert({
        user_id: user.userId,
        employee_id: `AGT-${phone}`,
        organization: 'DGE',
        zone: 'Non définie',
        is_active: true,
      });
      
      if (agentError) throw agentError;
      
      const { error: roleError } = await supabase.rpc('assign_agent_role', { 
        p_user_id: user.userId 
      });
      
      if (roleError) throw roleError;
      
      toast({
        title: 'Agent créé',
        description: `Agent créé pour ${user.fullName}`,
      });
      refetch();
    } catch (err) {
      console.error('Error creating agent:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'agent',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openMerchantDialog = (user: AdminUserData) => {
    setSelectedUser(user);
    setMerchantForm({
      fullName: user.fullName,
      phone: user.phone || '',
      cmuNumber: '',
      activityType: 'vivrier'
    });
    setMerchantDialogOpen(true);
  };

  const handleCreateMerchant = async () => {
    if (!selectedUser) return;
    if (!merchantForm.cmuNumber || !merchantForm.phone) {
      toast({
        title: 'Champs requis',
        description: 'Le téléphone et le numéro CMU sont obligatoires',
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const { error: merchantError } = await supabase.from('merchants').insert({
        user_id: selectedUser.userId,
        full_name: merchantForm.fullName,
        phone: merchantForm.phone,
        cmu_number: merchantForm.cmuNumber,
        activity_type: merchantForm.activityType,
        status: 'validated',
      });
      
      if (merchantError) throw merchantError;
      
      const { error: roleError } = await supabase.rpc('assign_merchant_role', { 
        p_user_id: selectedUser.userId 
      });
      
      if (roleError) throw roleError;
      
      toast({
        title: 'Marchand créé',
        description: `Marchand créé pour ${selectedUser.fullName}`,
      });
      setMerchantDialogOpen(false);
      refetch();
    } catch (err) {
      console.error('Error creating merchant:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le marchand',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openDeleteDialog = (user: AdminUserData) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.userId);
        
      if (rolesError) throw rolesError;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', selectedUser.userId);
        
      if (profileError) throw profileError;
      
      toast({
        title: 'Utilisateur supprimé',
        description: `${selectedUser.fullName} a été supprimé`,
      });
      setDeleteDialogOpen(false);
      refetch();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'utilisateur',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoFixAll = async () => {
    const orphans = users.filter(u => !u.hasLinkedEntity && u.expectedEntityType === 'agent');
    if (orphans.length === 0) {
      toast({
        title: 'Aucun orphelin à corriger',
        description: 'Aucun utilisateur orphelin de type agent détecté',
      });
      return;
    }
    
    setIsProcessing(true);
    let fixed = 0;
    
    for (const user of orphans) {
      try {
        const phone = user.phone || `07${Math.random().toString().slice(2, 10)}`;
        
        const { error: agentError } = await supabase.from('agents').insert({
          user_id: user.userId,
          employee_id: `AGT-${phone}`,
          organization: 'DGE',
          zone: 'Non définie',
          is_active: true,
        });
        
        if (!agentError) {
          await supabase.rpc('assign_agent_role', { p_user_id: user.userId });
          fixed++;
        }
      } catch (err) {
        console.error('Error fixing user:', err);
      }
    }
    
    toast({
      title: 'Correction terminée',
      description: `${fixed} utilisateur(s) corrigé(s)`,
    });
    setIsProcessing(false);
    refetch();
  };

  // Helper to determine entity type for card styling
  const getEntityType = (user: AdminUserData): 'merchant' | 'agent' | 'cooperative' | 'admin' | 'user' => {
    if (user.linkedMerchant) return 'merchant';
    if (user.linkedAgent) return 'agent';
    if (user.linkedCooperative) return 'cooperative';
    if (user.roles.includes('admin')) return 'admin';
    return 'user';
  };

  // Helper to get linked entity info
  const getLinkedInfo = (user: AdminUserData) => {
    if (user.linkedMerchant) {
      return {
        subtitle: `Marchand • ${user.linkedMerchant.phone}`,
        status: user.linkedMerchant.status as 'validated' | 'pending' | 'rejected' | 'suspended',
      };
    }
    if (user.linkedAgent) {
      return {
        subtitle: `Agent ${user.linkedAgent.organization} • ${user.linkedAgent.employee_id}`,
        status: user.linkedAgent.is_active ? 'active' as const : 'inactive' as const,
      };
    }
    if (user.linkedCooperative) {
      return {
        subtitle: `Coopérative • ${user.linkedCooperative.code}`,
        status: 'active' as const,
      };
    }
    return {
      subtitle: user.phone || 'Aucune entité liée',
      status: undefined,
    };
  };

  // Filter options
  const roleFilterOptions = [
    { value: 'all', label: 'Tous', count: stats.total },
    { value: 'admin', label: 'Admins' },
    { value: 'merchant', label: 'Marchands' },
    { value: 'agent', label: 'Agents' },
    { value: 'cooperative', label: 'Coopératives' },
  ];

  const linkedFilterOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'linked', label: 'Liés', count: stats.linked },
    { value: 'orphan', label: 'Orphelins', count: stats.orphan },
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        fullScreen
        title="Erreur de chargement"
        message="Impossible de charger les données utilisateurs."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <UnifiedHeader
        title="Utilisateurs"
        showBack
        backTo="/admin"
      />

      <PageHero
        title="Gestion des utilisateurs"
        subtitle="Profils et entités liées"
        count={stats.total}
        countLabel="utilisateurs"
        icon={Users}
        variant="default"
      >
        <FilterChips
          options={roleFilterOptions}
          value={filters.roleFilter}
          onChange={(value) => setFilters({ ...filters, roleFilter: value as AppRole | 'all' })}
        />
        <div className="mt-2">
          <FilterChips
            options={linkedFilterOptions}
            value={filters.linkedFilter}
            onChange={(value) => setFilters({ ...filters, linkedFilter: value as 'all' | 'linked' | 'orphan' })}
          />
        </div>
      </PageHero>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Orphan alert banner */}
        {stats.orphan > 0 && (
          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  ⚠️ {stats.orphan} utilisateur(s) orphelin(s)
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  Utilisateurs sans entité liée
                </p>
              </div>
              <Button 
                onClick={handleAutoFixAll} 
                variant="outline" 
                size="sm"
                className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:text-amber-400"
                disabled={isProcessing}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Corriger agents
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilters({ ...filters, search: value })}
          placeholder="Rechercher par nom, téléphone..."
        />

        {/* Results count + Export */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {users.length} résultat{users.length > 1 ? 's' : ''}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => exportUsersToCSV(users)}
            disabled={users.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </div>

        {/* User cards */}
        {users.length === 0 ? (
          <Card className="card-institutional">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </CardContent>
          </Card>
        ) : (
          <AnimatedList className="space-y-3">
            {users.map(user => {
              const linkedInfo = getLinkedInfo(user);
              const entityType = getEntityType(user);
              
              return (
                <AnimatedListItem key={user.userId}>
                  <UnifiedListCard
                    entityType={entityType}
                    title={user.fullName}
                    subtitle={`${linkedInfo.subtitle} • ${user.roles.map(r => roleConfig[r].label).join(', ')}`}
                    avatar={user.fullName?.charAt(0).toUpperCase()}
                    status={linkedInfo.status}
                    description={format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: fr })}
                    onClick={() => navigate(`/admin/utilisateurs/${user.userId}`)}
                    actions={!user.hasLinkedEntity ? (
                      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border" onClick={e => e.stopPropagation()}>
                        <Button size="sm" variant="outline" onClick={() => handleCreateAgent(user)} disabled={isProcessing}>
                          <UserCog className="h-3 w-3 mr-1" />
                          Créer Agent
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openMerchantDialog(user)} disabled={isProcessing}>
                          <Store className="h-3 w-3 mr-1" />
                          Créer Marchand
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(user)} disabled={isProcessing}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    ) : undefined}
                  />
                </AnimatedListItem>
              );
            })}
          </AnimatedList>
        )}
      </div>

      <UnifiedBottomNav items={adminNavItems} />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera le profil et les rôles de {selectedUser?.fullName}.
              L'utilisateur ne pourra plus se connecter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merchant creation dialog */}
      <Dialog open={merchantDialogOpen} onOpenChange={setMerchantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un marchand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={merchantForm.fullName}
                onChange={(e) => setMerchantForm({ ...merchantForm, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={merchantForm.phone}
                onChange={(e) => setMerchantForm({ ...merchantForm, phone: e.target.value })}
                placeholder="0759498436"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cmuNumber">Numéro CMU *</Label>
              <Input
                id="cmuNumber"
                value={merchantForm.cmuNumber}
                onChange={(e) => setMerchantForm({ ...merchantForm, cmuNumber: e.target.value })}
                placeholder="CMU-XXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activityType">Type d'activité</Label>
              <Select 
                value={merchantForm.activityType} 
                onValueChange={(value) => setMerchantForm({ ...merchantForm, activityType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vivrier">Vivrier</SelectItem>
                  <SelectItem value="textile">Textile</SelectItem>
                  <SelectItem value="restauration">Restauration</SelectItem>
                  <SelectItem value="commerce_general">Commerce général</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMerchantDialogOpen(false)} disabled={isProcessing}>
              Annuler
            </Button>
            <Button onClick={handleCreateMerchant} disabled={isProcessing}>
              {isProcessing ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
