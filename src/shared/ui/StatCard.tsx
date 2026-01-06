import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";

type StatCardVariant = "default" | "warning" | "success" | "primary";
type StatCardStyle = "institutional" | "merchant";

interface StatCardProps {
  /** Libellé de la stat */
  title: string;
  /** Valeur principale */
  value: string | number;
  /** Icône Lucide (pour style institutional) */
  icon?: LucideIcon;
  /** Emoji icône (pour style merchant) */
  emoji?: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Variante de couleur */
  variant?: StatCardVariant;
  /** Style de carte */
  cardStyle?: StatCardStyle;
  /** Callback au clic */
  onClick?: () => void;
  /** Classes additionnelles */
  className?: string;
}

const variantStyles: Record<StatCardVariant, string> = {
  default: "",
  warning: "border-amber-500/50 bg-amber-500/5",
  success: "border-green-500/50 bg-green-500/5",
  primary: "border-primary/50 bg-primary/5",
};

const subtitleVariantStyles: Record<StatCardVariant, string> = {
  default: "text-muted-foreground",
  warning: "text-amber-600 dark:text-amber-400 font-medium",
  success: "text-green-600 dark:text-green-400 font-medium",
  primary: "text-primary font-medium",
};

const iconVariantColors: Record<StatCardVariant, string> = {
  default: "text-primary bg-primary/10",
  warning: "text-warning bg-warning/10",
  success: "text-success bg-success/10",
  primary: "text-primary bg-primary/10",
};

const borderColorMap: Record<StatCardVariant, "orange" | "green" | "gold" | "violet"> = {
  default: "orange",
  warning: "gold",
  success: "green",
  primary: "violet",
};

/**
 * Carte de statistique unifiée
 * Supporte deux styles : institutional (Card classique) et merchant (GlassCard)
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  emoji,
  subtitle,
  variant = "default",
  cardStyle = "institutional",
  onClick,
  className,
}) => {
  // Style Merchant avec GlassCard et emoji
  if (cardStyle === "merchant") {
    return (
      <GlassCard
        borderColor={borderColorMap[variant]}
        padding="md"
        onClick={onClick}
        className={cn("flex items-center gap-3", className)}
      >
        {/* Emoji icône */}
        {emoji && <div className="text-3xl flex-shrink-0">{emoji}</div>}

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-inter uppercase tracking-wide truncate">
            {title}
          </p>
          <p className="text-xl font-nunito font-bold text-charbon truncate">
            {value}
          </p>
          {subtitle && (
            <p className={cn("text-xs mt-0.5", subtitleVariantStyles[variant])}>
              {subtitle}
            </p>
          )}
        </div>
      </GlassCard>
    );
  }

  // Style Institutional avec Card classique et icône Lucide
  // Si on a une icône, afficher le layout centré
  if (Icon) {
    return (
      <Card className={cn("card-institutional", className)}>
        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              iconVariantColors[variant]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
            {subtitle && (
              <p
                className={cn(
                  "text-[10px] mt-0.5",
                  subtitleVariantStyles[variant]
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Style Institutional sans icône (layout horizontal)
  return (
    <Card
      className={cn(
        "card-institutional transition-colors",
        onClick && "cursor-pointer hover:border-primary/50",
        variantStyles[variant],
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
        </div>
        <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
        {subtitle && (
          <p className={cn("text-xs mt-1", subtitleVariantStyles[variant])}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
