import { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle2, XCircle, Clock, Search, 
  User, FileText, MapPin, Eye, ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/shared/GlassCard';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { KycRequest, KycStatus } from '@/features/kyc/types/kyc.types';

interface KycRequestWithProfile extends KycRequest {
  profiles?: { full_name: string; phone: string } | null;
  merchants?: { full_name: string; phone: string; activity_type: string } | null;
}

export default function AdminKycReview() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<KycRequestWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('submitted');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [selectedRequest, setSelectedRequest] = useState<KycRequestWithProfile | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('kyc_requests')
        .select(`
          *,
          merchants:merchant_id (full_name, phone, activity_type)
        `)
        .order('submitted_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as KycStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Cast the data properly
      const typedData: KycRequestWithProfile[] = (data || []).map(item => ({
        ...item,
        level: item.level as KycRequest['level'],
        status: item.status as KycStatus,
        id_document_type: item.id_document_type as KycRequest['id_document_type'],
      }));

      setRequests(typedData);
    } catch (err) {
      console.error('Erreur chargement KYC:', err);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !user?.id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('kyc_requests')
        .update({
          status: 'approved' as const,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast.success('KYC approuvé avec succès');
      setIsReviewModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error('Erreur approbation:', err);
      toast.error('Erreur lors de l\'approbation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !user?.id || !rejectionReason) {
      toast.error('Veuillez indiquer une raison de refus');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('kyc_requests')
        .update({
          status: 'rejected' as const,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast.success('KYC rejeté');
      setIsReviewModalOpen(false);
      setRejectionReason('');
      fetchRequests();
    } catch (err) {
      console.error('Erreur rejet:', err);
      toast.error('Erreur lors du rejet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReview = (request: KycRequestWithProfile) => {
    setSelectedRequest(request);
    setIsReviewModalOpen(true);
    setRejectionReason('');
  };

  const getStatusBadge = (status: KycStatus) => {
    const configs: Record<KycStatus, { color: string; label: string }> = {
      draft: { color: 'bg-gray-100 text-gray-700', label: 'Brouillon' },
      submitted: { color: 'bg-blue-100 text-blue-700', label: 'En attente' },
      under_review: { color: 'bg-orange-100 text-orange-700', label: 'En examen' },
      approved: { color: 'bg-green-100 text-green-700', label: 'Approuvé' },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Rejeté' },
    };
    const config = configs[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredRequests = requests.filter(req => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      req.id_document_number?.toLowerCase().includes(search) ||
      req.merchants?.full_name?.toLowerCase().includes(search) ||
      req.merchants?.phone?.includes(search)
    );
  });

  const stats = {
    pending: requests.filter(r => r.status === 'submitted').length,
    underReview: requests.filter(r => r.status === 'under_review').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sable-doux to-white p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charbon flex items-center gap-2">
          <Shield className="w-6 h-6 text-vert-manioc" />
          Validation KYC
        </h1>
        <p className="text-charbon/60 text-sm">Vérification des demandes d'identité</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <GlassCard padding="sm" className="text-center">
          <Clock className="w-5 h-5 mx-auto text-blue-500 mb-1" />
          <p className="text-lg font-bold text-charbon">{stats.pending}</p>
          <p className="text-xs text-charbon/60">En attente</p>
        </GlassCard>
        <GlassCard padding="sm" className="text-center">
          <Eye className="w-5 h-5 mx-auto text-orange-500 mb-1" />
          <p className="text-lg font-bold text-charbon">{stats.underReview}</p>
          <p className="text-xs text-charbon/60">En examen</p>
        </GlassCard>
        <GlassCard padding="sm" className="text-center">
          <CheckCircle2 className="w-5 h-5 mx-auto text-green-500 mb-1" />
          <p className="text-lg font-bold text-charbon">{stats.approved}</p>
          <p className="text-xs text-charbon/60">Approuvés</p>
        </GlassCard>
        <GlassCard padding="sm" className="text-center">
          <XCircle className="w-5 h-5 mx-auto text-red-500 mb-1" />
          <p className="text-lg font-bold text-charbon">{stats.rejected}</p>
          <p className="text-xs text-charbon/60">Rejetés</p>
        </GlassCard>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="submitted">En attente</SelectItem>
            <SelectItem value="under_review">En examen</SelectItem>
            <SelectItem value="approved">Approuvés</SelectItem>
            <SelectItem value="rejected">Rejetés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />
          ))
        ) : filteredRequests.length === 0 ? (
          <GlassCard padding="lg" className="text-center">
            <Shield className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-charbon/60">Aucune demande KYC</p>
          </GlassCard>
        ) : (
          filteredRequests.map((request) => (
            <GlassCard 
              key={request.id} 
              padding="md"
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openReview(request)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-charbon">
                      {request.merchants?.full_name || 'Utilisateur'}
                    </p>
                    <p className="text-sm text-charbon/60">
                      {request.id_document_type?.toUpperCase()} • {request.id_document_number}
                    </p>
                    <p className="text-xs text-charbon/40">
                      {request.submitted_at && format(new Date(request.submitted_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(request.status)}
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Modal de revue */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-vert-manioc" />
              Vérification KYC
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Infos utilisateur */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-10 h-10 text-gray-400" />
                <div>
                  <p className="font-medium">{selectedRequest.merchants?.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.merchants?.phone}</p>
                  <p className="text-xs text-gray-400">{selectedRequest.merchants?.activity_type}</p>
                </div>
              </div>

              {/* Document */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-charbon">
                  <FileText className="w-4 h-4" />
                  Document d'identité
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium">
                      {selectedRequest.id_document_type?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Numéro:</span>
                    <span className="ml-2 font-medium">{selectedRequest.id_document_number}</span>
                  </div>
                </div>
                {selectedRequest.id_document_url && (
                  <img 
                    src={selectedRequest.id_document_url} 
                    alt="Document" 
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                )}
              </div>

              {/* Selfie */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-charbon">
                  <User className="w-4 h-4" />
                  Photo selfie
                </div>
                {selectedRequest.selfie_url && (
                  <img 
                    src={selectedRequest.selfie_url} 
                    alt="Selfie" 
                    className="w-32 h-32 object-cover rounded-lg border mx-auto"
                  />
                )}
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-charbon">
                  <MapPin className="w-4 h-4" />
                  Adresse
                </div>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedRequest.address}</p>
              </div>

              {/* Raison de rejet (si applicable) */}
              {selectedRequest.status !== 'approved' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charbon">
                    Raison du refus (optionnel pour approbation)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Ex: Photo floue, document expiré..."
                    className="w-full h-20 p-3 border rounded-lg resize-none text-sm"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {selectedRequest?.status !== 'approved' && selectedRequest?.status !== 'rejected' && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeter
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 bg-vert-manioc hover:bg-vert-manioc/90"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approuver
                </Button>
              </>
            )}
            {(selectedRequest?.status === 'approved' || selectedRequest?.status === 'rejected') && (
              <Button variant="outline" onClick={() => setIsReviewModalOpen(false)} className="w-full">
                Fermer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
