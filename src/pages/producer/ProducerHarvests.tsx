/**
 * Page Récoltes du Producteur - PNAVIM
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { 
  Sprout, 
  Package, 
  ShoppingCart, 
  User, 
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  useProducerData, 
  useProducerHarvests,
  HarvestCard,
  AddHarvestDialog
} from '@/features/producer';
import type { ProducerHarvest, HarvestFormData } from '@/features/producer';
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

const ProducerHarvests: React.FC = () => {
  const { producer, isLoading: isProducerLoading } = useProducerData();
  const { 
    harvests, 
    isLoading, 
    createHarvest, 
    updateHarvest,
    deleteHarvest,
    isCreating,
    isDeleting
  } = useProducerHarvests(producer?.id);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editHarvest, setEditHarvest] = useState<ProducerHarvest | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const navItems = [
    { icon: Sprout, label: 'Accueil', path: '/producteur' },
    { icon: Package, label: 'Récoltes', path: '/producteur/recoltes', isActive: true },
    { icon: ShoppingCart, label: 'Commandes', path: '/producteur/commandes' },
    { icon: User, label: 'Profil', path: '/producteur/profil' },
  ];

  const handleSubmit = (data: HarvestFormData) => {
    if (editHarvest) {
      updateHarvest({ harvestId: editHarvest.id, data });
    } else {
      createHarvest(data);
    }
    setIsDialogOpen(false);
    setEditHarvest(undefined);
  };

  const handleEdit = (harvest: ProducerHarvest) => {
    setEditHarvest(harvest);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteHarvest(deleteId);
      setDeleteId(null);
    }
  };

  const availableHarvests = harvests.filter(h => h.status === 'available');
  const otherHarvests = harvests.filter(h => h.status !== 'available');

  if (isProducerLoading) {
    return (
      <MobileLayout title="Mes Récoltes" navItems={navItems}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Mes Récoltes" navItems={navItems}>
      <div className="space-y-4 pb-6">
        {/* Add Button */}
        <Button 
          className="w-full gap-2" 
          onClick={() => {
            setEditHarvest(undefined);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Publier une récolte
        </Button>

        {/* Tabs */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available" className="gap-1">
              Disponibles ({availableHarvests.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1">
              Historique ({otherHarvests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-3 mt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : availableHarvests.length > 0 ? (
              availableHarvests.map((harvest) => (
                <HarvestCard 
                  key={harvest.id} 
                  harvest={harvest}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune récolte disponible</p>
                <p className="text-sm mt-1">Publiez votre première récolte pour la rendre visible aux coopératives</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3 mt-4">
            {otherHarvests.length > 0 ? (
              otherHarvests.map((harvest) => (
                <HarvestCard key={harvest.id} harvest={harvest} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun historique</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Dialog */}
      <AddHarvestDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        isLoading={isCreating}
        editHarvest={editHarvest}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Supprimer cette récolte ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La récolte ne sera plus visible par les coopératives.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
};

export default ProducerHarvests;
