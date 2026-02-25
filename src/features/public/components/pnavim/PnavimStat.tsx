// ============================================
// JÙLABA STAT - CARTE STATISTIQUE STANDARD
// ============================================
// Pour dashboards et résumés
// RÈGLE: Maximum 4 stats par écran, même hauteur partout

import React from 'react';
import { cn } from '@/shared/lib';
import { LucideIcon } from 'lucide-react';

type StatVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface PnavimStatProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  variant?: StatVariant;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

const iconBackgroundStyles: Record<StatVariant, string> = {
  default: 'bg-gray-100 text-gray-600',
  primary: 'bg-julaba-primary/10 text-julaba-primary',
  success: 'bg-julaba-secondary/10 text-julaba-secondary',
  warning: 'bg-amber-100 text-amber-600',
  danger: 'bg-red-100 text-julaba-destructive',
};

export const PnavimStat: React.FC<PnavimStatProps> = ({
  icon: Icon,
  value,
  label,
  variant = 'default',
  trend,
  className,
  onClick,
}) => {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        // Base
        "bg-white rounded-xl p-4 border border-julaba-border",
        // Layout
        "flex items-center gap-3",
        // Transition
        "transition-all duration-200",
        // Clickable
        isClickable && [
          "cursor-pointer",
          "hover:shadow-md",
          "active:scale-[0.99]",
        ],
        className
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Icon */}
      <div className={cn(
        "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
        iconBackgroundStyles[variant]
      )}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-julaba-foreground truncate">
            {value}
          </span>
          {trend && (
            <span className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-julaba-secondary" : "text-julaba-destructive"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
        <p className="text-sm text-julaba-muted truncate">
          {label}
        </p>
      </div>
    </div>
  );
};

export default PnavimStat;
