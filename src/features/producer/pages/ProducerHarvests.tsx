/**
 * Page Récoltes du Producteur - PNAVIM
 * Refonte Jùlaba Design System
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaButton,
  JulabaTabBar,
  JulabaBottomNav,
  JulabaEmptyState,
  type JulabaNavItem,
} from '@/shared/ui/julaba';
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

// Nav items Producteur
const PRODUCER_NAV_ITEMS: JulabaNavItem[] = [
  { emoji: '🌾', label: 'Accueil', path: '/producteur' },
  { emoji: '📦', label: 'Récoltes', path: '/producteur/recoltes' },
  { emoji: '🛒', label: 'Commandes', path: '/producteur/commandes' },
  { emoji: '👤', label: 'Profil', path: '/producteur/profil' },
];

const HARVEST_TABS = [
  { id: 'available', label: 'Disponibles', emoji: '✅' },
  { id: 'history', label: 'Historique', emoji: '📜' },
];

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

  const [activeTab, setActiveTab] = useState('available');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editHarvest, setEditHarvest] = useState<ProducerHarvest | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const displayedHarvests = activeTab === 'available' ? availableHarvests : otherHarvests;

  if (isProducerLoading) {
    return (
      <JulabaPageLayout background="gradient">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="gradient">
      <JulabaHeader
        title="Mes Récoltes"
        subtitle={`${harvests.length} récolte(s)`}
        showBack
        backPath="/producteur"
      />

      <div className="p-4 space-y-4">
        {/* Action principale */}
        <JulabaButton
          variant="hero"
          emoji="🌿"
          onClick={() => {
            setEditHarvest(undefined);
            setIsDialogOpen(true);
          }}
          className="w-full"
        >
          PUBLIER UNE RÉCOLTE
        </JulabaButton>

        {/* Tabs */}
        <JulabaTabBar
          tabs={HARVEST_TABS.map(t => ({
            ...t,
            label: `${t.label} (${t.id === 'available' ? availableHarvests.length : otherHarvests.length})`,
          }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Liste */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : displayedHarvests.length > 0 ? (
          <div className="space-y-3">
            {displayedHarvests.map((harvest) => (
              <JulabaCard key={harvest.id} className="p-3">
                <HarvestCard 
                  harvest={harvest}
                  onEdit={activeTab === 'available' ? handleEdit : undefined}
                  onDelete={activeTab === 'available' ? (id) => setDeleteId(id) : undefined}
                />
              </JulabaCard>
            ))}
          </div>
        ) : (
          <JulabaEmptyState
            emoji={activeTab === 'available' ? '🌱' : '📜'}
            title={activeTab === 'available' ? 'Aucune récolte disponible' : 'Aucun historique'}
            description={activeTab === 'available' 
              ? 'Publiez votre première récolte pour la rendre visible' 
              : 'Les récoltes passées apparaîtront ici'
            }
          />
        )}
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
              ⚠️ Supprimer cette récolte ?
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

      <JulabaBottomNav items={PRODUCER_NAV_ITEMS} />
    </JulabaPageLayout>
  );
};

export default ProducerHarvests;
