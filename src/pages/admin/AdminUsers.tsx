import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { UnifiedStatCard } from '@/components/shared/UnifiedStatCard';
import { DashboardSkeleton } from '@/components/admin/DashboardSkeleton';
import { useAdminUsersData, AdminUserData } from '@/hooks/useAdminUsersData';
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
  Filter
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

const UserCard: React.FC<{ user: AdminUserData }> = ({ user }) => {
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
    <Card className="card-institutional">
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
          <div className="bg-destructive/5 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">Aucune entité liée</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { users, stats, isLoading, error, filters, setFilters, refetch } = useAdminUsersData();

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

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {users.length} résultat{users.length > 1 ? 's' : ''}
        </p>

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
              <UserCard key={user.userId} user={user} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
