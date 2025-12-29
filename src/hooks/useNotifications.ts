import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  icon?: string;
}

// Notifications mock pour la démo
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Stock faible',
    message: '3 produits à réapprovisionner',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    icon: '📦'
  },
  {
    id: '2',
    title: 'Nouvelle commande',
    message: 'Commande reçue de Coopérative Vivriers',
    type: 'success',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
    icon: '🛒'
  },
  {
    id: '3',
    title: 'Crédit en retard',
    message: 'Amadou Diallo - 15 000 FCFA',
    type: 'error',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    icon: '💳'
  },
  {
    id: '4',
    title: 'Vente enregistrée',
    message: '5 000 FCFA encaissé avec succès',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    icon: '✅'
  }
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const formatTimeAgo = useCallback((date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays === 1) return 'hier';
    return `il y a ${diffDays}j`;
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    formatTimeAgo
  };
}
