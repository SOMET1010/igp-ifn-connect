import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { cn } from '@/lib/utils';

interface NotificationToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function NotificationToggle({ className, showLabel = true }: NotificationToggleProps) {
  const { isSupported, isSubscribed, permission, isLoading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const isDenied = permission === 'denied';

  return (
    <Button
      variant={isSubscribed ? "default" : "outline"}
      size={showLabel ? "default" : "icon"}
      onClick={handleToggle}
      disabled={isLoading || isDenied}
      className={cn(
        "transition-all",
        isSubscribed && "bg-primary text-primary-foreground",
        className
      )}
      title={isDenied ? "Notifications bloquées dans les paramètres du navigateur" : undefined}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="ml-2">
          {isDenied 
            ? "Notifications bloquées"
            : isSubscribed 
              ? "Notifications activées" 
              : "Activer les notifications"
          }
        </span>
      )}
    </Button>
  );
}
