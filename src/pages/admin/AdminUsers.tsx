import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { UnifiedStatCard } from '@/components/shared/UnifiedStatCard';
import { DashboardSkeleton } from '@/components/admin/DashboardSkeleton';
import { useAdminUsersData, AdminUserData, ExpectedEntityType } from '@/hooks/useAdminUsersData';
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
  Search, 
  AlertCircle, 
  RefreshCw,
  Store,
  UserCog,
  Wheat,
  Shield,
  Link,
  Unlink,
  Filter,
  Trash2,
  Wand2,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleConfig: Record<AppRole, { label: string; color: string; icon: React.ElementType }> = {
  admin: { label: 'Admin', color: 'bg-violet-500/10 text-violet-700 border-violet-500/30', icon: Shield },
  merchant: { label: 'Marchand', color: 'bg-orange-500/10 text-orange-700 border-orange-500/30', icon: Store },
  agent: { label: 'Agent', color: 'bg-blue-500/10 text-blue-700 border-blue-500/30', icon: UserCog },
  cooperative: { label: 'Coopérative', color: 'bg-green-500/10 text-green-700 border-green-500/30', icon: Wheat },
  user: { label: 'Utilisateur', color: 'bg-muted text-muted-foreground border-muted', icon: Users },
};

interface UserCardProps {
  user: AdminUserData;
  onCreateAgent: (user: AdminUserData) => void;
  onCreateMerchant: (user: AdminUserData) => void;
  onDeleteUser: (user: AdminUserData) => void;
  onViewDetail: (user: AdminUserData) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onCreateAgent, onCreateMerchant, onDeleteUser, onViewDetail }) => {
  const getLinkedEntityInfo = () => {
    if (user.linkedMerchant) {
      return {
        type: 'Marchand',
        name: user.linkedMerchant.full_name,
        detail: `📞 ${user.linkedMerchant.phone}`,
        status: user.linkedMerchant.status,
        icon: Store,
        color: 'text-orange-600',
      };
    }
    if (user.linkedAgent) {
      return {
        type: 'Agent',
        name: user.linkedAgent.employee_id,
        detail: user.linkedAgent.organization,
        status: user.linkedAgent.is_active ? 'actif' : 'inactif',
        icon: UserCog,
        color: 'text-blue-600',
      };
    }
    if (user.linkedCooperative) {
      return {
        type: 'Coopérative',
        name: user.linkedCooperative.name,
        detail: `${user.linkedCooperative.code} • ${user.linkedCooperative.region}`,
        status: 'active',
        icon: Wheat,
        color: 'text-green-600',
      };
    }
    return null;
  };

  const linkedEntity = getLinkedEntityInfo();

  return (
    <Card 
      className="card-institutional cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onViewDetail(user)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with name and date */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground truncate">{user.fullName}</p>
            {user.phone && (
              <p className="text-sm text-muted-foreground">📞 {user.phone}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: fr })}
          </p>
        </div>

        {/* Roles */}
        <div className="flex flex-wrap gap-1.5">
          {user.roles.map(role => {
            const config = roleConfig[role];
            return (
              <Badge 
                key={role} 
                variant="outline" 
                className={`text-xs ${config.color}`}
              >
                {config.label}
              </Badge>
            );
          })}
        </div>

        {/* Linked entity */}
        {linkedEntity ? (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <linkedEntity.icon className={`h-4 w-4 ${linkedEntity.color}`} />
              <span className="text-sm font-medium">{linkedEntity.type}</span>
              <Badge 
                variant="outline" 
                className={`text-xs ml-auto ${
                  linkedEntity.status === 'validated' || linkedEntity.status === 'actif' || linkedEntity.status === 'active'
                    ? 'bg-green-500/10 text-green-700 border-green-500/30'
                    : 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                }`}
              >
                {linkedEntity.status}
              </Badge>
            </div>
            <p className="text-sm text-foreground font-medium">{linkedEntity.name}</p>
            <p className="text-xs text-muted-foreground">{linkedEntity.detail}</p>
          </div>
        ) : (
          <div className="bg-destructive/5 rounded-lg p-3 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">Aucune entité liée</span>
            </div>
            
            {user.expectedEntityType !== 'unknown' && (
              <p className="text-xs text-muted-foreground">
                Type suggéré : <Badge variant="outline" className="ml-1">{user.expectedEntityType}</Badge>
              </p>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onCreateAgent(user)}>
                <UserCog className="h-3 w-3 mr-1" />
                Créer Agent
              </Button>
              <Button size="sm" variant="outline" onClick={() => onCreateMerchant(user)}>
                <Store className="h-3 w-3 mr-1" />
                Créer Marchand
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDeleteUser(user)}>
                <Trash2 className="h-3 w-3 mr-1" />
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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
      
      // Assign agent role
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
      
      // Assign merchant role
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
      // Delete user roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.userId);
        
      if (rolesError) throw rolesError;
      
      // Delete profile
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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Erreur de chargement</h2>
        <p className="text-muted-foreground text-center mb-4">
          Impossible de charger les données utilisateurs.
        </p>
        <Button onClick={refetch} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <UnifiedHeader
        title="Utilisateurs"
        subtitle={`${stats.total} utilisateurs`}
        showBack
        backTo="/admin"
      />

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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <UnifiedStatCard
            title="Total"
            value={stats.total}
            icon={Users}
          />
          <UnifiedStatCard
            title="Liés"
            value={stats.linked}
            icon={Link}
            variant="success"
          />
          <UnifiedStatCard
            title="Orphelins"
            value={stats.orphan}
            icon={Unlink}
            variant={stats.orphan > 0 ? 'warning' : 'default'}
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, téléphone..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={filters.roleFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, roleFilter: 'all' })}
          >
            Tous
          </Button>
          {(['admin', 'merchant', 'agent', 'cooperative'] as AppRole[]).map(role => (
            <Button
              key={role}
              variant={filters.roleFilter === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, roleFilter: role })}
              className="whitespace-nowrap"
            >
              {roleConfig[role].label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant={filters.linkedFilter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilters({ ...filters, linkedFilter: 'all' })}
          >
            <Filter className="h-4 w-4 mr-1" />
            Tous
          </Button>
          <Button
            variant={filters.linkedFilter === 'linked' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilters({ ...filters, linkedFilter: 'linked' })}
          >
            <Link className="h-4 w-4 mr-1" />
            Liés
          </Button>
          <Button
            variant={filters.linkedFilter === 'orphan' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilters({ ...filters, linkedFilter: 'orphan' })}
          >
            <Unlink className="h-4 w-4 mr-1" />
            Orphelins
          </Button>
        </div>

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
        <div className="space-y-3">
          {users.length === 0 ? (
            <Card className="card-institutional">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
              </CardContent>
            </Card>
          ) : (
            users.map(user => (
              <UserCard 
                key={user.userId} 
                user={user}
                onCreateAgent={handleCreateAgent}
                onCreateMerchant={openMerchantDialog}
                onDeleteUser={openDeleteDialog}
                onViewDetail={(u) => navigate(`/admin/utilisateurs/${u.userId}`)}
              />
            ))
          )}
        </div>
      </div>

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