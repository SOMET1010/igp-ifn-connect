// ============================================
// Types - Notifications
// Système de notifications en temps réel
// ============================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationCategory = 'stock' | 'order' | 'credit' | 'payment' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  icon?: string | null;
  read: boolean;
  action_url?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string | null;
}

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  icon?: string;
  action_url?: string;
  metadata?: Record<string, any>;
}
