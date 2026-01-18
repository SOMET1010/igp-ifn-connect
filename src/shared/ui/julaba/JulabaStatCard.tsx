/**
 * JulabaStatCard - Carte statistique avec icône XXL
 * 
 * Design: Pictogramme-first, chiffre géant, label simple
 */
import { cn } from '@/lib/utils';
import { JulabaCard } from './JulabaCard';

export interface JulabaStatCardProps {
  /** Emoji ou icône */
  emoji: string;
  /** Valeur principale (chiffre) */
  value: string | number;
  /** Label descriptif */
  label: string;
  /** Couleur de fond de l'icône */
  iconBg?: 'orange' | 'green' | 'gold' | 'blue' | 'purple';
  /** Suffixe optionnel (ex: "FCFA") */
  suffix?: string;
  /** Tendance optionnelle */
  trend?: 'up' | 'down' | 'neutral';
  /** Au clic */
  onClick?: () => void;
  className?: string;
}

const iconBgColors = {
  orange: 'bg-[hsl(30_100%_92%)]',
  green: 'bg-[hsl(145_70%_92%)]',
  gold: 'bg-[hsl(45_100%_90%)]',
  blue: 'bg-[hsl(210_100%_92%)]',
  purple: 'bg-[hsl(270_70%_92%)]',
};

export function JulabaStatCard({
  emoji,
  value,
  label,
  iconBg = 'orange',
  suffix,
  trend,
  onClick,
  className,
}: JulabaStatCardProps) {
  return (
    <JulabaCard
      interactive={!!onClick}
      onClick={onClick}
      className={cn("flex items-center gap-4", className)}
      padding="md"
    >
      {/* Icône */}
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center",
        iconBgColors[iconBg]
      )}>
        <span className="text-2xl">{emoji}</span>
      </div>
      
      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-foreground truncate">
            {value}
          </span>
          {suffix && (
            <span className="text-sm font-medium text-muted-foreground">
              {suffix}
            </span>
          )}
          {trend && (
            <span className={cn(
              "text-lg",
              trend === 'up' && 'text-green-500',
              trend === 'down' && 'text-red-500',
            )}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground font-medium truncate">
          {label}
        </p>
      </div>
    </JulabaCard>
  );
}
