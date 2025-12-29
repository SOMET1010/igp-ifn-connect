// ============================================
// Service - Notifications
// CRUD pour les notifications
// ============================================

import { supabase } from "@/integrations/supabase/client";
import type { Notification, CreateNotificationInput } from "../types/notification.types";

/**
 * Récupérer les notifications d'un utilisateur
 */
export async function getNotifications(userId: string, limit = 50): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }

  return (data || []) as Notification[];
}

/**
 * Compter les notifications non lues
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.error("Error counting unread notifications:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Marquer une notification comme lue
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Marquer toutes les notifications comme lues
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

/**
 * Supprimer une notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}

/**
 * Créer une notification (pour usage interne/testing)
 */
export async function createNotification(input: CreateNotificationInput): Promise<string> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: input.user_id,
      type: input.type,
      category: input.category,
      title: input.title,
      message: input.message,
      icon: input.icon,
      action_url: input.action_url,
      metadata: input.metadata || {},
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    throw error;
  }

  return data.id;
}
