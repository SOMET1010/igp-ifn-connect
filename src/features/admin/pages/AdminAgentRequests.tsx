import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Clock, CheckCircle, XCircle, MapPin, Phone, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from '@/components/ui/textarea';

import { EnhancedHeader, PageHero, FilterChips, SearchInput, AnimatedList, type FilterOption } from '@/shared/ui';

import { useAdminAgentRequests, type AgentRequest } from '@/features/admin';

const statusFilters: FilterOption[] = [
  { value: 'pending', label: 'En attente', icon: Clock },
  { value: 'approved', label: 'Approuvées', icon: CheckCircle },
  { value: 'rejected', label: 'Refusées', icon: XCircle },
  { value: 'all', label: 'Toutes' },
];

const statusConfig = {
  pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
  approved: { label: 'Approuvée', variant: 'default' as const, icon: CheckCircle },
  rejected: { label: 'Refusée', variant: 'destructive' as const, icon: XCircle },
};

export default function AdminAgentRequests() {
  const navigate = useNavigate();
  const {
    requests,
    isLoading,
    error,
    filters,
    setFilters,
    stats,
    approveRequest,
    rejectRequest,
  } = useAdminAgentRequests();

  const [selectedRequest, setSelectedRequest] = useState<AgentRequest | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    const success = await approveRequest(selectedRequest);
    setIsProcessing(false);
    if (success) {
      setShowApproveDialog(false);
      setSelectedRequest(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) return;
    setIsProcessing(true);
    const success = await rejectRequest(selectedRequest, rejectReason);
    setIsProcessing(false);
    if (success) {
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectReason('');
    }
  };

  const openApproveDialog = (request: AgentRequest) => {
    setSelectedRequest(request);
    setShowApproveDialog(true);
  };

  const openRejectDialog = (request: AgentRequest) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <EnhancedHeader
        title="Demandes d'agents"
        showBack
        backTo="/admin"
      />

      <main className="pb-6">
        <PageHero
          title="Demandes d'inscription"
          subtitle="Validez ou rejetez les demandes d'agents"
          icon={UserPlus}
          variant="primary"
          count={stats.pending}
          countLabel="en attente"
        />

        <div className="px-4 space-y-4">
          {/* Filters */}
          <FilterChips
            options={statusFilters}
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value as typeof filters.status })}
          />

          {/* Search */}
          <SearchInput
            value={filters.search}
            onChange={(value) => setFilters({ ...filters, search: value })}
            placeholder="Rechercher par nom, téléphone..."
          />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-amber-500/10 rounded-lg p-2">
              <div className="text-lg font-bold text-amber-600">{stats.pending}</div>
              <div className="text-xs text-muted-foreground">En attente</div>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-2">
              <div className="text-lg font-bold text-emerald-600">{stats.approved}</div>
              <div className="text-xs text-muted-foreground">Approuvées</div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-2">
              <div className="text-lg font-bold text-red-600">{stats.rejected}</div>
              <div className="text-xs text-muted-foreground">Refusées</div>
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <Card className="p-6 text-center">
              <p className="text-destructive">{error}</p>
            </Card>
          ) : requests.length === 0 ? (
            <Card className="p-6 text-center">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Aucune demande trouvée</p>
            </Card>
          ) : (
            <AnimatedList className="space-y-3">
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <RequestCard
                    request={request}
                    onApprove={() => openApproveDialog(request)}
                    onReject={() => openRejectDialog(request)}
                  />
                </motion.div>
              ))}
            </AnimatedList>
          )}
        </div>
      </main>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approuver cette demande ?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRequest?.full_name} sera créé comme agent avec accès au tableau de bord agent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isProcessing ? 'Approbation...' : 'Approuver'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter cette demande</DialogTitle>
            <DialogDescription>
              Indiquez la raison du rejet pour {selectedRequest?.full_name}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Raison du rejet..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isProcessing}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectReason.trim()}
            >
              {isProcessing ? 'Rejet...' : 'Confirmer le rejet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface RequestCardProps {
  request: AgentRequest;
  onApprove: () => void;
  onReject: () => void;
}

function RequestCard({ request, onApprove, onReject }: RequestCardProps) {
  const status = statusConfig[request.status];
  const StatusIcon = status.icon;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {request.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{request.full_name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {request.organization}
              </p>
            </div>
          </div>
          <Badge variant={status.variant}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{request.phone}</span>
          </div>
          {request.preferred_zone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{request.preferred_zone}</span>
            </div>
          )}
        </div>

        {/* Motivation */}
        {request.motivation && (
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2 line-clamp-2">
            "{request.motivation}"
          </p>
        )}

        {/* Rejection reason */}
        {request.status === 'rejected' && request.rejection_reason && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-2">
            <strong>Motif :</strong> {request.rejection_reason}
          </p>
        )}

        {/* Date */}
        <p className="text-xs text-muted-foreground">
          Soumis le {format(new Date(request.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
        </p>

        {/* Actions */}
        {request.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              onClick={onApprove}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approuver
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/10"
              onClick={onReject}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Rejeter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
