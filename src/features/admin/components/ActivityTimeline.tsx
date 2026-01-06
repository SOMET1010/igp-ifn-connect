import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  UserPlus, Edit, Shield, UserCog, Store, CheckCircle, 
  Building2, UserCheck, Banknote, FileText, Circle
} from 'lucide-react';
import { type UserActivity } from '@/features/admin';
import { cn } from '@/shared/lib';

interface ActivityTimelineProps {
  activities: UserActivity[];
  maxItems?: number;
}

const iconMap: Record<string, React.ElementType> = {
  UserPlus,
  Edit,
  Shield,
  UserCog,
  Store,
  CheckCircle,
  Building2,
  UserCheck,
  Banknote,
  FileText,
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ 
  activities, 
  maxItems 
}) => {
  const displayedActivities = maxItems ? activities.slice(0, maxItems) : activities;

  if (displayedActivities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Aucune activité enregistrée</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {displayedActivities.map((activity, index) => {
        const IconComponent = iconMap[activity.icon] || Circle;
        const isLast = index === displayedActivities.length - 1;

        return (
          <div key={activity.id} className="flex gap-3">
            {/* Timeline line and icon */}
            <div className="flex flex-col items-center">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0",
                  activity.color
                )}
              >
                <IconComponent className="h-4 w-4" />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-border my-1 min-h-[16px]" />
              )}
            </div>

            {/* Content */}
            <div className={cn("flex-1 pb-4", isLast && "pb-0")}>
              <p className="text-sm font-medium">{activity.description}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(activity.timestamp), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
              </p>
              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="mt-1.5 text-xs bg-muted/50 rounded px-2 py-1 inline-flex gap-2 flex-wrap">
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    value && (
                      <span key={key} className="text-muted-foreground">
                        <span className="font-medium">{key}:</span> {String(value)}
                      </span>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {maxItems && activities.length > maxItems && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          +{activities.length - maxItems} autres événements
        </p>
      )}
    </div>
  );
};
