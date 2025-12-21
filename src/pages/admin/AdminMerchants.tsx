import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Search,
  Check,
  X,
  Pause,
  Loader2,
  Phone,
  MapPin
} from 'lucide-react';

interface Merchant {
  id: string;
  full_name: string;
  phone: string;
  activity_type: string;
  status: 'pending' | 'validated' | 'rejected' | 'suspended';
  cmu_number: string;
  enrolled_at: string;
  market_name?: string;
}

const statusLabels = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  validated: { label: 'Validé', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800' },
  suspended: { label: 'Suspendu', color: 'bg-gray-100 text-gray-800' },
};

const AdminMerchants: React.FC = () => {
  const navigate = useNavigate();
  
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMerchants = async () => {
    let query = supabase
      .from('merchants')
      .select(`
        id,
        full_name,
        phone,
        activity_type,
        status,
        cmu_number,
        enrolled_at,
        market_id
      `)
      .order('enrolled_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter as 'pending' | 'validated' | 'rejected' | 'suspended');
    }

    const { data } = await query;

    if (data) {
      // Fetch market names
      const marketIds = data.filter(m => m.market_id).map(m => m.market_id);
      const { data: markets } = await supabase
        .from('markets')
        .select('id, name')
        .in('id', marketIds);

      const enrichedMerchants = data.map(m => ({
        ...m,
        status: m.status as Merchant['status'],
        market_name: markets?.find(market => market.id === m.market_id)?.name
      }));

      setMerchants(enrichedMerchants);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchMerchants();
  }, [statusFilter]);

  const updateStatus = async (id: string, newStatus: 'validated' | 'rejected' | 'suspended') => {
    setUpdatingId(id);

    const updateData: { status: 'validated' | 'rejected' | 'suspended'; validated_at?: string } = { status: newStatus };
    if (newStatus === 'validated') {
      updateData.validated_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('merchants')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success(`Marchand ${statusLabels[newStatus].label.toLowerCase()}`);
      await fetchMerchants();
    }

    setUpdatingId(null);
  };

  const filteredMerchants = merchants.filter(m =>
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery) ||
    m.cmu_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="bg-gradient-to-r from-violet-800 to-violet-700 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Marchands</h1>
            <p className="text-sm text-white/80">{merchants.length} marchand(s)</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="validated">Validés</SelectItem>
              <SelectItem value="rejected">Rejetés</SelectItem>
              <SelectItem value="suspended">Suspendus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Merchants list */}
        {filteredMerchants.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aucun marchand trouvé</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredMerchants.map((merchant) => (
              <Card key={merchant.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{merchant.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{merchant.activity_type}</p>
                    </div>
                    <Badge className={statusLabels[merchant.status].color}>
                      {statusLabels[merchant.status].label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground mb-3">
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      +225 {merchant.phone}
                    </p>
                    {merchant.market_name && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {merchant.market_name}
                      </p>
                    )}
                    <p className="text-xs">CMU: {merchant.cmu_number}</p>
                  </div>

                  {merchant.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateStatus(merchant.id, 'validated')}
                        disabled={updatingId === merchant.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {updatingId === merchant.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Valider
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(merchant.id, 'rejected')}
                        disabled={updatingId === merchant.id}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {merchant.status === 'validated' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(merchant.id, 'suspended')}
                      disabled={updatingId === merchant.id}
                      className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Suspendre
                    </Button>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    Inscrit le {new Date(merchant.enrolled_at).toLocaleDateString('fr-FR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMerchants;
