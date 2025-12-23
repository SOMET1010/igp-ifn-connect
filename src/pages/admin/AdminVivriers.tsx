import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Users, Building2, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingState } from '@/components/shared/StateComponents';

interface Cooperative {
  id: string;
  name: string;
  code: string | null;
  region: string | null;
  commune: string | null;
  effectif_total: number;
  effectif_cmu: number;
  effectif_cnps: number;
  created_at: string;
}

interface Member {
  id: string;
  actor_key: string;
  cooperative_name: string;
  full_name: string;
  identifier_code: string | null;
  phone: string | null;
  cmu_status: string | null;
  cnps_status: string | null;
}

interface ImportResult {
  table: string;
  inserted: number;
  updated: number;
  rejected: number;
  errors: Array<{ row: number; error: string }>;
}

const AdminVivriers: React.FC = () => {
  const navigate = useNavigate();
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null);
  const [selectedTab, setSelectedTab] = useState('cooperatives');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [coopsResponse, membersResponse] = await Promise.all([
        supabase.from('vivriers_cooperatives').select('*').order('name'),
        supabase.from('vivriers_members').select('*').order('cooperative_name, row_number').limit(1000),
      ]);

      if (coopsResponse.error) throw coopsResponse.error;
      if (membersResponse.error) throw membersResponse.error;

      setCooperatives(coopsResponse.data || []);
      setMembers(membersResponse.data || []);
    } catch (error) {
      console.error('Error fetching vivriers data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: Record<string, string>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      rows.push(row);
    }
    
    return rows;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'cooperatives' | 'members') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResults(null);

    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length === 0) {
        toast.error('Fichier CSV vide ou invalide');
        setIsImporting(false);
        return;
      }

      console.log(`Parsed ${data.length} rows for ${type}`);

      const payload = type === 'cooperatives' 
        ? { cooperatives: data }
        : { members: data };

      const { data: result, error } = await supabase.functions.invoke('import-vivriers', {
        body: payload,
      });

      if (error) throw error;

      if (result.success) {
        setImportResults(result.results);
        toast.success('Import terminé avec succès');
        fetchData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Erreur lors de l'import: ${error}`);
    } finally {
      setIsImporting(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleLinkMembers = async () => {
    setIsImporting(true);
    try {
      // Manual linking - iterate through cooperatives and update members
      console.log('Linking members manually...');
      
      const { data: coops } = await supabase
        .from('vivriers_cooperatives')
        .select('id, name');
      
      if (coops) {
        for (const coop of coops) {
          await supabase
            .from('vivriers_members')
            .update({ cooperative_id: coop.id })
            .eq('cooperative_name', coop.name)
            .is('cooperative_id', null);
        }
      }
      
      toast.success('Membres liés aux coopératives');
      fetchData();
    } catch (error) {
      console.error('Link error:', error);
      toast.error('Erreur lors de la liaison');
    } finally {
      setIsImporting(false);
    }
  };

  const filteredCooperatives = cooperatives.filter(coop =>
    coop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coop.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coop.commune?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = members.filter(member =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.cooperative_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.actor_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.identifier_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMembers = members.length;
  const totalCoops = cooperatives.length;

  if (isLoading) {
    return <LoadingState message="Chargement des données vivriers..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Données Vivriers</h1>
            <p className="text-sm opacity-80">Import et gestion des coopératives</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalCoops}</p>
              <p className="text-sm text-muted-foreground">Coopératives</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalMembers}</p>
              <p className="text-sm text-muted-foreground">Membres</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Section */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Coopératives (markets.csv)</label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, 'cooperatives')}
                  disabled={isImporting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Membres (actors.csv)</label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, 'members')}
                  disabled={isImporting}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleLinkMembers} disabled={isImporting} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isImporting ? 'animate-spin' : ''}`} />
                Lier membres aux coopératives
              </Button>
              <Button onClick={fetchData} disabled={isImporting} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>

            {/* Import Results */}
            {importResults && (
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Résultats de l'import
                </h4>
                {importResults.map((result, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium">{result.table}</p>
                    <div className="flex gap-4 text-muted-foreground">
                      <span className="text-green-600">✓ {result.inserted} insérés</span>
                      <span className="text-blue-600">↻ {result.updated} mis à jour</span>
                      {result.rejected > 0 && (
                        <span className="text-red-600">✗ {result.rejected} rejetés</span>
                      )}
                    </div>
                    {result.errors.length > 0 && result.errors.length <= 5 && (
                      <div className="mt-1 text-xs text-red-600">
                        {result.errors.map((err, i) => (
                          <p key={i}>Ligne {err.row}: {err.error}</p>
                        ))}
                      </div>
                    )}
                    {result.errors.length > 5 && (
                      <p className="mt-1 text-xs text-red-600">
                        + {result.errors.length - 5} autres erreurs...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="px-4">
        <Input
          placeholder="Rechercher par nom, coopérative ou numéro (ex: PACA-001)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
      </div>

      {/* Tabs */}
      <div className="px-4 pb-24">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cooperatives">
              Coopératives ({filteredCooperatives.length})
            </TabsTrigger>
            <TabsTrigger value="members">
              Membres ({filteredMembers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cooperatives" className="space-y-3 mt-4">
            {filteredCooperatives.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg">Aucune coopérative</h3>
                <p className="text-sm text-muted-foreground">Importez un fichier CSV pour commencer</p>
              </div>
            ) : (
              filteredCooperatives.map((coop) => (
                <Card key={coop.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{coop.name}</h3>
                        {coop.code && (
                          <p className="text-sm text-muted-foreground">{coop.code}</p>
                        )}
                        {(coop.region || coop.commune) && (
                          <p className="text-sm text-muted-foreground">
                            {[coop.commune, coop.region].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{coop.effectif_total} membres</Badge>
                        <div className="flex gap-2 mt-1">
                          {coop.effectif_cmu > 0 && (
                            <Badge variant="outline" className="text-xs">
                              CMU: {coop.effectif_cmu}
                            </Badge>
                          )}
                          {coop.effectif_cnps > 0 && (
                            <Badge variant="outline" className="text-xs">
                              CNPS: {coop.effectif_cnps}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-3 mt-4">
            {filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg">Aucun membre</h3>
                <p className="text-sm text-muted-foreground">Importez un fichier CSV pour commencer</p>
              </div>
            ) : (
              filteredMembers.slice(0, 100).map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="font-mono text-xs bg-primary/10 text-primary">
                            {member.actor_key}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{member.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{member.cooperative_name}</p>
                        {member.phone && (
                          <p className="text-xs text-muted-foreground mt-1">{member.phone}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {member.cmu_status && (
                          <Badge variant={member.cmu_status === 'oui' ? 'default' : 'outline'} className="text-xs">
                            CMU
                          </Badge>
                        )}
                        {member.cnps_status && (
                          <Badge variant={member.cnps_status === 'oui' ? 'default' : 'outline'} className="text-xs">
                            CNPS
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {filteredMembers.length > 100 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Affichage limité à 100 membres. Utilisez la recherche pour filtrer.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminVivriers;
