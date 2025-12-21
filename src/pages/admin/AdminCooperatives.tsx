import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft,
  Search,
  Loader2,
  MapPin,
  Users,
  Award
} from 'lucide-react';

interface Cooperative {
  id: string;
  name: string;
  code: string;
  region: string;
  commune: string;
  igp_certified: boolean;
  total_members: number;
}

const AdminCooperatives: React.FC = () => {
  const navigate = useNavigate();
  
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCooperatives = async () => {
      const { data } = await supabase
        .from('cooperatives')
        .select('*')
        .order('name');

      if (data) {
        setCooperatives(data);
      }

      setIsLoading(false);
    };

    fetchCooperatives();
  }, []);

  const filteredCooperatives = cooperatives.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.commune.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-xl font-bold">Coopératives</h1>
            <p className="text-sm text-white/80">{cooperatives.length} coopérative(s)</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher une coopérative..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Cooperatives list */}
        {filteredCooperatives.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aucune coopérative trouvée</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredCooperatives.map((coop) => (
              <Card key={coop.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">🌾</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{coop.name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{coop.code}</p>
                      </div>
                    </div>
                    {coop.igp_certified && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Award className="w-3 h-3 mr-1" />
                        IGP
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {coop.commune}, {coop.region}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {coop.total_members} membre(s)
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCooperatives;
