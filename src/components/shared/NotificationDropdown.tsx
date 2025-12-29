import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { useSensoryFeedback } from '@/hooks/useSensoryFeedback';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  formatTimeAgo: (date: Date) => string;
}

function NotificationItem({ notification, onRead, onDelete, formatTimeAgo }: NotificationItemProps) {
  const typeColors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500'
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50",
        !notification.read && "bg-primary/5"
      )}
      onClick={() => onRead(notification.id)}
    >
      {/* Icon + Unread indicator */}
      <div className="relative flex-shrink-0">
        <span className="text-xl">{notification.icon || '📌'}</span>
        {!notification.read && (
          <span className={cn(
            "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full",
            typeColors[notification.type]
          )} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm truncate",
          !notification.read ? "font-semibold text-foreground" : "text-muted-foreground"
        )}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    formatTimeAgo 
  } = useNotifications();
  const { triggerTap } = useSensoryFeedback();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative h-9 w-9", className)}
          onClick={() => triggerTap()}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-[400px] overflow-y-auto bg-popover border border-border shadow-lg z-50"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary hover:text-primary"
              onClick={markAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Tout lire
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Aucune notification
          </div>
        ) : (
          <div className="p-1 space-y-1">
            {notifications.slice(0, 5).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                onDelete={deleteNotification}
                formatTimeAgo={formatTimeAgo}
              />
            ))}
          </div>
        )}

        {notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary cursor-pointer">
              Voir toutes les notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
