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
  Users
} from 'lucide-react';

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

  useEffect(() => {
    const fetchAgents = async () => {
      const { data: agentsData } = await supabase
        .from('agents')
        .select('*')
        .order('total_enrollments', { ascending: false });

      if (agentsData) {
        // Fetch profile names
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

    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(a =>
    a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.zone?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-xl font-bold">Agents</h1>
            <p className="text-sm text-white/80">{agents.length} agent(s)</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un agent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Agents list */}
        {filteredAgents.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aucun agent trouvé</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAgents.map((agent) => (
              <Card key={agent.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">👤</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{agent.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{agent.organization}</p>
                      </div>
                    </div>
                    <Badge className={agent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {agent.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {agent.employee_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground justify-end">
                      <Users className="h-4 w-4" />
                      <span className="font-semibold text-foreground">{agent.total_enrollments}</span>
                      <span>enrôlements</span>
                    </div>
                  </div>

                  {agent.zone && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <MapPin className="h-4 w-4" />
                      Zone: {agent.zone}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAgents;
