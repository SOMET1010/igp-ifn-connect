import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";

interface SafeMetricProps {
  label: string;
  value: number | string | null | undefined;
  unit?: string;
  fallback?: string;
  isLoading?: boolean;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * SafeMetric - Affiche une métrique avec gestion des valeurs null/undefined
 * Jamais d'écran blanc, toujours un fallback humain.
 */
export function SafeMetric({
  label,
  value,
  unit = "",
  fallback = "—",
  isLoading = false,
  icon,
  size = "md",
  className = "",
}: SafeMetricProps) {
  const sizeClasses = {
    sm: {
      label: "text-xs",
      value: "text-lg",
    },
    md: {
      label: "text-sm",
      value: "text-2xl",
    },
    lg: {
      label: "text-base",
      value: "text-3xl",
    },
  };

  // Format number with thousand separators
  const formatValue = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined || val === "") {
      return fallback;
    }

    if (typeof val === "number") {
      return new Intl.NumberFormat("fr-FR").format(val);
    }

    return String(val);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className={`${sizeClasses[size].label} text-muted-foreground mb-1`}>
          {label}
        </span>
        <Skeleton className={`h-8 w-20`} />
      </div>
    );
  }

  const displayValue = formatValue(value);
  const displayUnit = value !== null && value !== undefined && value !== "" ? unit : "";

  return (
    <div className={`flex flex-col ${className}`}>
      <span
        className={`${sizeClasses[size].label} text-muted-foreground flex items-center gap-1`}
      >
        {icon}
        {label}
      </span>
      <span className={`${sizeClasses[size].value} font-bold text-foreground`}>
        {displayValue}
        {displayUnit && (
          <span className="text-muted-foreground font-normal ml-1 text-base">
            {displayUnit}
          </span>
        )}
      </span>
    </div>
  );
}
