import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ArrowLeft, User, Phone, Calendar, Shield, UserCog, 
  Store, Building2, MapPin, CheckCircle, Clock,
  Banknote, FileText, Users, RefreshCw, Pencil, Save, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ActivityTimeline } from '@/components/admin/ActivityTimeline';
import { useAdminUserDetail } from '@/hooks/useAdminUserDetail';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const roleConfig: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-red-500' },
  agent: { label: 'Agent', color: 'bg-blue-500' },
  merchant: { label: 'Marchand', color: 'bg-orange-500' },
  cooperative: { label: 'Coopérative', color: 'bg-green-500' },
  user: { label: 'Utilisateur', color: 'bg-gray-500' },
};

const AdminUserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useAdminUserDetail(userId);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openEditDialog = () => {
    if (data.profile) {
      setEditFullName(data.profile.fullName);
      setEditPhone(data.profile.phone || '');
      setEditDialogOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      toast.error('Le nom est obligatoire');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editFullName.trim(),
          phone: editPhone.trim() || null,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Profil mis à jour');
      setEditDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data.profile) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Button variant="ghost" onClick={() => navigate('/admin/utilisateurs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Card className="mt-4">
          <CardContent className="p-8 text-center">
            <p className="text-destructive">
              {error?.message || 'Utilisateur non trouvé'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, roles, linkedAgent, linkedMerchant, linkedCooperative, activities, stats } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/utilisateurs')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{profile.fullName}</h1>
              <p className="text-xs text-muted-foreground">Détails utilisateur</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openEditDialog}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Info */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{profile.fullName}</h2>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  {profile.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Membre depuis {format(new Date(profile.createdAt), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>
              </div>
            </div>

            {/* Roles */}
            <div className="flex items-center gap-2 flex-wrap">
              <Shield className="h-4 w-4 text-muted-foreground" />
              {roles.map(role => (
                <Badge 
                  key={role} 
                  className={`${roleConfig[role]?.color || 'bg-gray-500'} text-white`}
                >
                  {roleConfig[role]?.label || role}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Linked Entity */}
        {linkedAgent && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCog className="h-5 w-5 text-blue-500" />
                Agent lié
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">ID Employé</p>
                  <p className="font-medium">{linkedAgent.employeeId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Organisation</p>
                  <p className="font-medium">{linkedAgent.organization}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Zone</p>
                  <p className="font-medium">{linkedAgent.zone || 'Non définie'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Statut</p>
                  <Badge variant={linkedAgent.isActive ? 'default' : 'secondary'}>
                    {linkedAgent.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{stats.enrollmentsCount}</strong> enrôlements
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {linkedMerchant && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="h-5 w-5 text-orange-500" />
                Marchand lié
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">N° CMU</p>
                  <p className="font-medium">{linkedMerchant.cmuNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Activité</p>
                  <p className="font-medium capitalize">{linkedMerchant.activityType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Statut</p>
                  <Badge variant={linkedMerchant.status === 'validated' ? 'default' : 'secondary'}>
                    {linkedMerchant.status === 'validated' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {linkedMerchant.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                    {linkedMerchant.status}
                  </Badge>
                </div>
                {linkedMerchant.marketName && (
                  <div>
                    <p className="text-muted-foreground">Marché</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {linkedMerchant.marketName}
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{stats.totalTransactions}</strong> transactions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{stats.invoicesCount}</strong> factures
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total: <strong>{stats.totalAmount.toLocaleString('fr-FR')} FCFA</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {linkedCooperative && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-500" />
                Coopérative liée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nom</p>
                  <p className="font-medium">{linkedCooperative.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Code</p>
                  <p className="font-medium">{linkedCooperative.code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Région</p>
                  <p className="font-medium">{linkedCooperative.region}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Commune</p>
                  <p className="font-medium">{linkedCooperative.commune}</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <span className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <strong>{linkedCooperative.totalMembers}</strong> membres
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No linked entity */}
        {!linkedAgent && !linkedMerchant && !linkedCooperative && (
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-4 text-center">
              <p className="text-amber-700 dark:text-amber-400">
                ⚠️ Aucune entité liée à cet utilisateur
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Utilisateur orphelin - retournez à la liste pour corriger
              </p>
            </CardContent>
          </Card>
        )}

        {/* Activity History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Historique d'activité</span>
              <Badge variant="outline">{activities.length} événements</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline activities={activities} />
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet *</Label>
              <Input
                id="fullName"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                placeholder="Entrez le nom complet"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Ex: 0701234567"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserDetail;
