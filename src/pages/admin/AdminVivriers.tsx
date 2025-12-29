import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Users, Building2, RefreshCw, FileText, Wheat, MapPin, Phone, HeartPulse, Shield, ChevronDown, LayoutDashboard, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { adminLogger } from '@/infra/logger';
import { LoadingState, EmptyState } from '@/components/shared/StateComponents';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { PageHero } from '@/components/shared/PageHero';
import { FilterChips } from '@/components/shared/FilterChips';
import { UnifiedListCard } from '@/components/shared/UnifiedListCard';
import { UnifiedBottomNav, NavItem } from '@/components/shared/UnifiedBottomNav';
import { AnimatedList } from '@/components/shared/AnimatedList';
import { AnimatedListItem } from '@/components/shared/AnimatedListItem';
import { SearchInput } from '@/components/shared/SearchInput';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

// Navigation items pour admin
const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
  { icon: Wheat, label: 'Vivriers', path: '/admin/vivriers' },
  { icon: BarChart3, label: 'Rapports', path: '/admin/reports' },
  { icon: Settings, label: 'Paramètres', path: '/admin/monitoring' },
];

const AdminVivriers: React.FC = () => {
  const navigate = useNavigate();
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null);
  const [selectedView, setSelectedView] = useState('cooperatives');
  const [importOpen, setImportOpen] = useState(false);

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
      adminLogger.error('Error fetching vivriers data', error);
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

      adminLogger.debug(`Parsed ${data.length} rows for ${type}`);

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
      adminLogger.error('Import error', error);
      toast.error(`Erreur lors de l'import: ${error}`);
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const handleLinkMembers = async () => {
    setIsImporting(true);
    try {
      adminLogger.debug('Linking members manually...');
      
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
      adminLogger.error('Link error', error);
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

  const viewOptions = [
    { value: 'cooperatives', label: `Coopératives (${filteredCooperatives.length})` },
    { value: 'members', label: `Membres (${filteredMembers.length})` },
  ];

  if (isLoading) {
    return <LoadingState message="Chargement des données vivriers..." />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <UnifiedHeader
        title="Données Vivriers"
        showBack
        backTo="/admin"
      />

      {/* PageHero avec double compteur */}
      <PageHero
        icon={Wheat}
        title="Données Vivriers"
        subtitle="Import et gestion des coopératives agricoles"
        variant="accent"
      >
        {/* Double compteur */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{cooperatives.length}</span>
            <span className="text-sm text-muted-foreground">coopératives</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{members.length}</span>
            <span className="text-sm text-muted-foreground">membres</span>
          </div>
        </div>

        {/* Recherche */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher par nom, coopérative ou code..."
          className="mb-4"
        />

        {/* FilterChips pour basculer entre vues */}
        <FilterChips
          options={viewOptions}
          value={selectedView}
          onChange={setSelectedView}
        />
      </PageHero>

      {/* Section Import Collapsible */}
      <div className="px-4 py-4 max-w-4xl mx-auto">
        <Collapsible open={importOpen} onOpenChange={setImportOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import CSV
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${importOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <Card>
              <CardContent className="p-4 space-y-4">
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
                  <Button onClick={handleLinkMembers} disabled={isImporting} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isImporting ? 'animate-spin' : ''}`} />
                    Lier membres
                  </Button>
                  <Button onClick={fetchData} disabled={isImporting} variant="outline" size="sm">
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
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Liste des données */}
      <div className="px-4 max-w-4xl mx-auto">
        {selectedView === 'cooperatives' ? (
          <>
            {filteredCooperatives.length === 0 ? (
              <EmptyState
                Icon={Building2}
                title="Aucune coopérative"
                message="Importez un fichier CSV pour commencer"
              />
            ) : (
              <AnimatedList className="space-y-3">
                {filteredCooperatives.map((coop) => (
                  <AnimatedListItem key={coop.id}>
                    <UnifiedListCard
                      entityType="cooperative"
                      title={coop.name}
                      subtitle={coop.code || undefined}
                      avatarFallback="🌾"
                      status="active"
                      statusLabel={`${coop.effectif_total} membres`}
                      metadata={[
                        ...(coop.commune || coop.region ? [{
                          icon: MapPin,
                          text: [coop.commune, coop.region].filter(Boolean).join(', ')
                        }] : []),
                        ...(coop.effectif_cmu > 0 ? [{
                          icon: HeartPulse,
                          text: `CMU: ${coop.effectif_cmu}`,
                          className: 'text-green-600'
                        }] : []),
                        ...(coop.effectif_cnps > 0 ? [{
                          icon: Shield,
                          text: `CNPS: ${coop.effectif_cnps}`,
                          className: 'text-blue-600'
                        }] : []),
                      ]}
                    />
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            )}
          </>
        ) : (
          <>
            {filteredMembers.length === 0 ? (
              <EmptyState
                Icon={Users}
                title="Aucun membre"
                message="Importez un fichier CSV pour commencer"
              />
            ) : (
              <>
                <AnimatedList className="space-y-3">
                  {filteredMembers.slice(0, 100).map((member) => (
                    <AnimatedListItem key={member.id}>
                      <UnifiedListCard
                        entityType="user"
                        title={member.full_name}
                        subtitle={`${member.actor_key} • ${member.cooperative_name}`}
                        avatarFallback={member.full_name.slice(0, 2).toUpperCase()}
                        status={member.cmu_status === 'oui' ? 'active' : undefined}
                        statusLabel={member.cmu_status === 'oui' ? 'CMU' : undefined}
                        metadata={[
                          ...(member.phone ? [{
                            icon: Phone,
                            text: member.phone
                          }] : []),
                          ...(member.cnps_status === 'oui' ? [{
                            icon: Shield,
                            text: 'CNPS',
                            className: 'text-blue-600'
                          }] : []),
                        ]}
                        actions={
                          <div className="flex gap-1">
                            {member.cmu_status === 'oui' && (
                              <Badge variant="default" className="text-xs">CMU</Badge>
                            )}
                            {member.cnps_status === 'oui' && (
                              <Badge variant="secondary" className="text-xs">CNPS</Badge>
                            )}
                          </div>
                        }
                        showChevron={false}
                      />
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
                {filteredMembers.length > 100 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Affichage limité à 100 membres. Utilisez la recherche pour filtrer.
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <UnifiedBottomNav items={adminNavItems} />
    </div>
  );
};

export default AdminVivriers;
