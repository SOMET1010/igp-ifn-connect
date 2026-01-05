/**
 * Page publique des Coopératives Vivriers
 * Affiche les coopératives et leurs membres producteurs
 */

import React, { useState } from 'react';
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
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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

const VivriersCooperativesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCooperative, setSelectedCooperative] = useState<VivriersCooperative | null>(null);
  const [showMembersDialog, setShowMembersDialog] = useState(false);

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
      
      // Chercher par cooperative_id OU cooperative_name pour couvrir les deux cas
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

  // Filter cooperatives
  const filteredCoops = cooperatives.filter(coop =>
    coop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coop.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coop.commune?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats totales
  const totalMembers = cooperatives.reduce((acc, c) => acc + (c.effectif_total || 0), 0);
  const totalCmu = cooperatives.reduce((acc, c) => acc + (c.effectif_cmu || 0), 0);
  const totalCnps = cooperatives.reduce((acc, c) => acc + (c.effectif_cnps || 0), 0);

  const handleViewMembers = (coop: VivriersCooperative) => {
    setSelectedCooperative(coop);
    setShowMembersDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-accent/10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Coopératives Vivriers</h1>
            <p className="text-sm text-muted-foreground">Producteurs agricoles de Côte d'Ivoire</p>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            <Wheat className="h-3 w-3 mr-1" />
            PNAVIM
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">{cooperatives.length}</p>
              <p className="text-xs text-muted-foreground">Coopératives</p>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/10 border-secondary/20">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <p className="text-2xl font-bold text-secondary">{totalMembers.toLocaleString('fr-FR')}</p>
              <p className="text-xs text-muted-foreground">Producteurs</p>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold text-blue-500">{totalCmu.toLocaleString('fr-FR')}</p>
              <p className="text-xs text-muted-foreground">Affiliés CMU</p>
            </CardContent>
          </Card>
          
          <Card className="bg-accent/10 border-accent/20">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-amber-600">{totalCnps.toLocaleString('fr-FR')}</p>
              <p className="text-xs text-muted-foreground">Affiliés CNPS</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search */}
        <motion.div
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
            {filteredCoops.map((coop, index) => (
              <motion.div
                key={coop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card 
                  className="hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-secondary"
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
                    
                    <div className="flex items-center gap-3 pt-2 border-t">
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {coop.effectif_total || 0} membres
                      </Badge>
                      {coop.effectif_cmu && coop.effectif_cmu > 0 && (
                        <Badge variant="outline" className="text-xs text-blue-600">
                          CMU: {coop.effectif_cmu}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredCoops.length === 0 && !loadingCoops && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucune coopérative trouvée</p>
            <p className="text-sm text-muted-foreground">Essayez une autre recherche</p>
          </div>
        )}
      </main>

      {/* Members Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-secondary" />
              {selectedCooperative?.name}
            </DialogTitle>
            {selectedCooperative && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCooperative.region && (
                  <Badge variant="outline">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedCooperative.region}
                  </Badge>
                )}
                {selectedCooperative.commune && (
                  <Badge variant="outline">{selectedCooperative.commune}</Badge>
                )}
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  {selectedCooperative.effectif_total || 0} membres
                </Badge>
              </div>
            )}
          </DialogHeader>

          <ScrollArea className="max-h-[50vh]">
            {loadingMembers ? (
              <div className="space-y-2 p-4">
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
            ) : members.length > 0 ? (
              <div className="space-y-2 p-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="h-10 w-10 bg-secondary/20 rounded-full flex items-center justify-center">
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
                    <div className="flex flex-col gap-1">
                      {member.cmu_status === 'actif' && (
                        <Badge className="text-xs bg-blue-500">CMU</Badge>
                      )}
                      {member.cnps_status === 'actif' && (
                        <Badge className="text-xs bg-amber-500">CNPS</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Aucun membre enregistré</p>
              </div>
            )}
          </ScrollArea>

          {selectedCooperative && (
            <div className="border-t pt-4 space-y-2">
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
