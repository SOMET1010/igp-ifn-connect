/**
 * Page publique des Coopératives Vivriers
 * Affiche les coopératives et leurs membres producteurs
 * Sécurisée : bannière d'invitation à se connecter si non authentifié
 */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  ChevronRight,
  Search,
  ArrowLeft,
  Wheat,
  Shield,
  MoreVertical,
  FileDown,
  SortAsc,
  Filter,
  ArrowUpDown,
  LogIn
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExportCooperativesPDF } from '@/features/public/components/ExportCooperativesPDF';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface VivriersCooperative {
  id: string;
  name: string;
  code: string | null;
  region: string | null;
  commune: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  effectif_total: number | null;
  effectif_cmu: number | null;
  effectif_cnps: number | null;
  latitude: number | null;
  longitude: number | null;
}

interface VivriersMember {
  id: string;
  full_name: string;
  phone: string | null;
  cooperative_name: string;
  cmu_status: string | null;
  cnps_status: string | null;
  identifier_code: string | null;
}

type SortOption = 'name' | 'members' | 'cmu';
type CmuFilter = 'all' | 'with' | 'without';
type SizeFilter = 'all' | 'small' | 'medium' | 'large';

const VivriersCooperativesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCooperative, setSelectedCooperative] = useState<VivriersCooperative | null>(null);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  
  // Filtres et tri
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterCmu, setFilterCmu] = useState<CmuFilter>('all');
  const [filterSize, setFilterSize] = useState<SizeFilter>('all');

  // Vérifier si l'utilisateur est admin ou coopérative
  const isAdminOrCoop = userRole === 'admin' || userRole === 'cooperative';

  // Fetch cooperatives
  const { data: cooperatives = [], isLoading: loadingCoops } = useQuery({
    queryKey: ['vivriers-cooperatives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vivriers_cooperatives')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as VivriersCooperative[];
    },
  });

  // Fetch members for selected cooperative
  const { data: members = [], isLoading: loadingMembers } = useQuery({
    queryKey: ['vivriers-members', selectedCooperative?.id, selectedCooperative?.name],
    queryFn: async () => {
      if (!selectedCooperative) return [];
      
      const { data, error } = await supabase
        .from('vivriers_members')
        .select('*')
        .or(`cooperative_id.eq.${selectedCooperative.id},cooperative_name.eq.${selectedCooperative.name}`)
        .order('full_name');
      
      if (error) throw error;
      return data as VivriersMember[];
    },
    enabled: !!selectedCooperative,
  });

  // Filter and sort cooperatives
  const filteredAndSortedCoops = useMemo(() => {
    let result = cooperatives.filter(coop =>
      coop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coop.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coop.commune?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtre CMU
    if (filterCmu === 'with') {
      result = result.filter(c => (c.effectif_cmu || 0) > 0);
    } else if (filterCmu === 'without') {
      result = result.filter(c => (c.effectif_cmu || 0) === 0);
    }

    // Filtre taille
    if (filterSize === 'small') {
      result = result.filter(c => (c.effectif_total || 0) < 50);
    } else if (filterSize === 'medium') {
      result = result.filter(c => (c.effectif_total || 0) >= 50 && (c.effectif_total || 0) < 200);
    } else if (filterSize === 'large') {
      result = result.filter(c => (c.effectif_total || 0) >= 200);
    }

    // Tri
    return result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'members') {
        return (b.effectif_total || 0) - (a.effectif_total || 0);
      } else if (sortBy === 'cmu') {
        return (b.effectif_cmu || 0) - (a.effectif_cmu || 0);
      }
      return 0;
    });
  }, [cooperatives, searchTerm, sortBy, filterCmu, filterSize]);

  // Filter members in dialog
  const filteredMembers = useMemo(() => {
    if (!memberSearchTerm) return members;
    return members.filter(m =>
      m.full_name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
      m.phone?.includes(memberSearchTerm) ||
      m.identifier_code?.toLowerCase().includes(memberSearchTerm.toLowerCase())
    );
  }, [members, memberSearchTerm]);

  // Stats totales
  const totalMembers = cooperatives.reduce((acc, c) => acc + (c.effectif_total || 0), 0);
  const totalCmu = cooperatives.reduce((acc, c) => acc + (c.effectif_cmu || 0), 0);
  const totalCnps = cooperatives.reduce((acc, c) => acc + (c.effectif_cnps || 0), 0);

  const handleViewMembers = (coop: VivriersCooperative) => {
    setSelectedCooperative(coop);
    setMemberSearchTerm('');
    setShowMembersDialog(true);
  };

  // Export PDF des membres de la coopérative sélectionnée
  const exportMembersPDF = () => {
    if (!selectedCooperative || members.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setTextColor(34, 139, 34);
    doc.text(selectedCooperative.name, pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${members.length} membres • Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 28, { align: 'center' });

    const cmuCount = members.filter(m => m.cmu_status === 'actif').length;
    const cnpsCount = members.filter(m => m.cnps_status === 'actif').length;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`CMU: ${cmuCount} | CNPS: ${cnpsCount}`, 14, 40);

    autoTable(doc, {
      startY: 48,
      head: [['Nom', 'Téléphone', 'Code', 'CMU', 'CNPS']],
      body: members.map(m => [
        m.full_name,
        m.phone || '-',
        m.identifier_code || '-',
        m.cmu_status === 'actif' ? 'Oui' : 'Non',
        m.cnps_status === 'actif' ? 'Oui' : 'Non',
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [34, 139, 34], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`membres-${selectedCooperative.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  // Stats cards config
  const statsConfig = [
    { icon: Building2, value: cooperatives.length, label: 'Coopératives', colorClass: 'text-primary', bgClass: 'bg-primary/10', borderClass: 'border-primary/20' },
    { icon: Users, value: totalMembers, label: 'Producteurs', colorClass: 'text-secondary', bgClass: 'bg-secondary/10', borderClass: 'border-secondary/20' },
    { icon: Shield, value: totalCmu, label: 'Affiliés CMU', colorClass: 'text-blue-600', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/20' },
    { icon: Users, value: totalCnps, label: 'Affiliés CNPS', colorClass: 'text-amber-600', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/20' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-accent/10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">Coopératives Vivriers</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Producteurs agricoles de Côte d'Ivoire</p>
          </div>
          
          <Badge variant="secondary" className="hidden md:flex shrink-0">
            <Wheat className="h-3 w-3 mr-1" />
            PNAVIM
          </Badge>

          {/* Bouton de connexion si non authentifié */}
          {!isAuthenticated && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => navigate('/cooperative/login')}
              className="shrink-0"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Connexion
            </Button>
          )}

          {/* Menu d'actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <div className="w-full">
                  <ExportCooperativesPDF
                    cooperatives={filteredAndSortedCoops}
                    stats={{
                      total: cooperatives.length,
                      members: totalMembers,
                      cmu: totalCmu,
                      cnps: totalCnps,
                    }}
                  />
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Trier par</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                <SortAsc className="h-4 w-4 mr-2" />
                Nom (A-Z) {sortBy === 'name' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('members')}>
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Effectif (desc) {sortBy === 'members' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('cmu')}>
                <Shield className="h-4 w-4 mr-2" />
                Affiliés CMU {sortBy === 'cmu' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards - Design uniformisé */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {statsConfig.map((stat) => (
            <Card key={stat.label} className={`${stat.bgClass} ${stat.borderClass}`}>
              <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                <stat.icon className={`h-6 w-6 ${stat.colorClass} mb-1`} />
                <p className={`text-xl font-bold ${stat.colorClass}`}>
                  {stat.value.toLocaleString('fr-FR')}
                </p>
                <p className="text-xs text-muted-foreground text-center">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Bannière de connexion pour les non-authentifiés */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <LogIn className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Accédez à votre espace coopérative</p>
                <p className="text-sm text-muted-foreground">Connectez-vous pour gérer vos membres et commandes</p>
              </div>
            </div>
            <Button onClick={() => navigate('/cooperative/login')}>
              Se connecter
            </Button>
          </motion.div>
        )}

        {/* Search & Filters */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une coopérative, région..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            <Select value={filterCmu} onValueChange={(v) => setFilterCmu(v as CmuFilter)}>
              <SelectTrigger className="w-[130px] h-9">
                <Shield className="h-3 w-3 mr-1 text-blue-600" />
                <SelectValue placeholder="CMU" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous (CMU)</SelectItem>
                <SelectItem value="with">Avec CMU</SelectItem>
                <SelectItem value="without">Sans CMU</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSize} onValueChange={(v) => setFilterSize(v as SizeFilter)}>
              <SelectTrigger className="w-[130px] h-9">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Taille" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes tailles</SelectItem>
                <SelectItem value="small">&lt; 50 membres</SelectItem>
                <SelectItem value="medium">50-200 membres</SelectItem>
                <SelectItem value="large">&gt; 200 membres</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[140px] h-9">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Trier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom (A-Z)</SelectItem>
                <SelectItem value="members">Effectif</SelectItem>
                <SelectItem value="cmu">Affiliés CMU</SelectItem>
              </SelectContent>
            </Select>

            {/* Compteur résultats */}
            <Badge variant="outline" className="h-9 px-3 flex items-center">
              {filteredAndSortedCoops.length} coopérative{filteredAndSortedCoops.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </motion.div>

        {/* Cooperatives Grid */}
        {loadingCoops ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredAndSortedCoops.map((coop, index) => (
              <motion.div
                key={coop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(0.05 * index, 0.3) }}
              >
                <Card 
                  className="hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-secondary h-full"
                  onClick={() => handleViewMembers(coop)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-start justify-between gap-2">
                      <span className="line-clamp-2">{coop.name}</span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardTitle>
                    {coop.code && (
                      <Badge variant="outline" className="w-fit text-xs">
                        {coop.code}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(coop.region || coop.commune) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-1">
                          {[coop.commune, coop.region].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {coop.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{coop.phone}</span>
                      </div>
                    )}
                    
                    {/* Badges alignés */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t">
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {coop.effectif_total || 0} membres
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${(coop.effectif_cmu || 0) > 0 ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-muted-foreground'}`}
                      >
                        CMU: {coop.effectif_cmu || 0}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredAndSortedCoops.length === 0 && !loadingCoops && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucune coopérative trouvée</p>
            <p className="text-sm text-muted-foreground">Essayez une autre recherche ou modifiez les filtres</p>
          </div>
        )}
      </main>

      {/* Members Dialog - Amélioré */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-secondary shrink-0" />
                  <span className="truncate">{selectedCooperative?.name}</span>
                </DialogTitle>
                {selectedCooperative && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCooperative.region && (
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedCooperative.region}
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {selectedCooperative.effectif_total || 0} membres
                    </Badge>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      CMU: {selectedCooperative.effectif_cmu || 0}
                    </Badge>
                    <Badge variant="outline" className="text-amber-600 border-amber-200">
                      CNPS: {selectedCooperative.effectif_cnps || 0}
                    </Badge>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={exportMembersPDF} disabled={members.length === 0}>
                <FileDown className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </DialogHeader>

          {/* Recherche locale */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un membre..."
              value={memberSearchTerm}
              onChange={(e) => setMemberSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="max-h-[45vh]">
            {loadingMembers ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex gap-4 p-3 bg-muted rounded-lg">
                    <div className="h-10 w-10 bg-muted-foreground/20 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                      <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMembers.length > 0 ? (
              <div className="space-y-2 p-2">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="h-10 w-10 bg-secondary/20 rounded-full flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.full_name}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {member.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {member.phone}
                          </span>
                        )}
                        {member.identifier_code && (
                          <Badge variant="outline" className="text-xs">
                            {member.identifier_code}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {member.cmu_status === 'actif' && (
                        <Badge className="text-xs bg-blue-500 hover:bg-blue-600">CMU</Badge>
                      )}
                      {member.cnps_status === 'actif' && (
                        <Badge className="text-xs bg-amber-500 hover:bg-amber-600">CNPS</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {memberSearchTerm ? 'Aucun membre correspondant' : 'Aucun membre enregistré'}
                </p>
              </div>
            )}
          </ScrollArea>

          {selectedCooperative && (selectedCooperative.phone || selectedCooperative.email) && (
            <div className="border-t pt-4 flex flex-wrap gap-4">
              {selectedCooperative.phone && (
                <a 
                  href={`tel:${selectedCooperative.phone}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {selectedCooperative.phone}
                </a>
              )}
              {selectedCooperative.email && (
                <a 
                  href={`mailto:${selectedCooperative.email}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {selectedCooperative.email}
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VivriersCooperativesPage;
