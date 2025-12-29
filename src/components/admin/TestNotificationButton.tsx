// ============================================
// Component - Test Notification Button
// Bouton admin pour tester le système Realtime
// ============================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, TestTube } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createNotification, NotificationType, NotificationCategory } from '@/features/notifications';
import { toast } from 'sonner';
import { adminLogger } from '@/infra/logger';

const NOTIFICATION_TYPES: { value: NotificationType; label: string; icon: string }[] = [
  { value: 'info', label: 'Info', icon: 'ℹ️' },
  { value: 'success', label: 'Succès', icon: '✅' },
  { value: 'warning', label: 'Avertissement', icon: '⚠️' },
  { value: 'error', label: 'Erreur', icon: '🚨' },
];

const NOTIFICATION_CATEGORIES: { value: NotificationCategory; label: string }[] = [
  { value: 'stock', label: 'Stock' },
  { value: 'order', label: 'Commande' },
  { value: 'credit', label: 'Crédit' },
  { value: 'system', label: 'Système' },
];

export const TestNotificationButton: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    message: string;
  }>({
    type: 'info',
    category: 'system',
    title: 'Notification de test',
    message: 'Ceci est une notification de test pour vérifier le système Realtime.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Utilisateur non connecté');
      return;
    }

    setIsLoading(true);
    try {
      const selectedType = NOTIFICATION_TYPES.find(t => t.value === formData.type);
      
      await createNotification({
        user_id: user.id,
        type: formData.type,
        category: formData.category,
        title: formData.title,
        message: formData.message,
        icon: selectedType?.icon || '🔔',
        action_url: '/admin',
        metadata: { test: true, created_by: 'admin_test_button' },
      });
      
      toast.success('Notification créée ! Vérifiez le dropdown.');
      setOpen(false);
    } catch (error) {
      adminLogger.error('Error creating test notification', error);
      toast.error('Erreur lors de la création de la notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <TestTube className="h-4 w-4" />
          Test Notification
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Tester le système de notifications
          </DialogTitle>
          <DialogDescription>
            Créez une notification de test pour vérifier que le système Realtime fonctionne correctement.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as NotificationType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as NotificationCategory }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Titre de la notification"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Message de la notification"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Création...' : 'Créer la notification'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
