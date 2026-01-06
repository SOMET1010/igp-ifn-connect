import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, X, Pause, AlertCircle, Shield, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/lib';

export type StatusType = 
  | 'validated' | 'pending' | 'rejected' | 'suspended'
  | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'
  | 'active' | 'inactive' | 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, { 
  label: string; 
  icon: React.ElementType;
  className: string;
}> = {
  // Marchands & entités
  validated: { 
    label: 'Validé', 
    icon: Check,
    className: 'bg-secondary/15 text-secondary border-secondary/30'
  },
  pending: { 
    label: 'En attente', 
    icon: Clock,
    className: 'bg-warning/15 text-warning-foreground border-warning/30'
  },
  rejected: { 
    label: 'Rejeté', 
    icon: X,
    className: 'bg-destructive/15 text-destructive border-destructive/30'
  },
  suspended: { 
    label: 'Suspendu', 
    icon: Pause,
    className: 'bg-muted text-muted-foreground border-muted-foreground/20'
  },
  // Commandes
  confirmed: { 
    label: 'Confirmé', 
    icon: Check,
    className: 'bg-secondary/15 text-secondary border-secondary/30'
  },
  in_transit: { 
    label: 'En transit', 
    icon: TrendingUp,
    className: 'bg-primary/15 text-primary border-primary/30'
  },
  delivered: { 
    label: 'Livré', 
    icon: Check,
    className: 'bg-secondary/15 text-secondary border-secondary/30'
  },
  cancelled: { 
    label: 'Annulé', 
    icon: X,
    className: 'bg-destructive/15 text-destructive border-destructive/30'
  },
  // Génériques
  active: { 
    label: 'Actif', 
    icon: Shield,
    className: 'bg-secondary/15 text-secondary border-secondary/30'
  },
  inactive: { 
    label: 'Inactif', 
    icon: Pause,
    className: 'bg-muted text-muted-foreground border-muted-foreground/20'
  },
  success: { 
    label: 'Succès', 
    icon: Check,
    className: 'bg-secondary/15 text-secondary border-secondary/30'
  },
  warning: { 
    label: 'Attention', 
    icon: AlertCircle,
    className: 'bg-warning/15 text-warning-foreground border-warning/30'
  },
  error: { 
    label: 'Erreur', 
    icon: X,
    className: 'bg-destructive/15 text-destructive border-destructive/30'
  },
  info: { 
    label: 'Info', 
    icon: AlertCircle,
    className: 'bg-primary/15 text-primary border-primary/30'
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const config = statusConfig[status] || statusConfig.info;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline"
      className={cn(
        'font-medium border inline-flex items-center whitespace-nowrap',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{label || config.label}</span>
    </Badge>
  );
};
