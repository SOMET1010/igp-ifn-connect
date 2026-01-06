import { cn } from "@/lib/utils";

interface BigNumberProps {
  value: number | string;
  suffix?: string;
  label?: string;
  className?: string;
  animate?: boolean;
  color?: "primary" | "secondary" | "success" | "muted";
}

const BigNumber = ({
  value,
  suffix = "FCFA",
  label,
  className,
  animate = false,
  color = "primary"
}: BigNumberProps) => {
  const colorClasses = {
    primary: "text-foreground",
    secondary: "text-secondary",
    success: "text-[hsl(142,76%,36%)]",
    muted: "text-muted-foreground"
  };

  const formattedValue = typeof value === "number" 
    ? value.toLocaleString("fr-FR") 
    : value;

  return (
    <div className={cn("text-center", className)}>
      {label && (
        <p className="text-lg sm:text-xl text-muted-foreground mb-2 font-medium">
          {label}
        </p>
      )}
      <div className={cn(
        "text-5xl sm:text-6xl md:text-7xl font-black tracking-tight",
        colorClasses[color],
        animate && "animate-pulse"
      )}>
        {formattedValue}
        {suffix && (
          <span className="text-2xl sm:text-3xl font-bold ml-2 opacity-80">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export { BigNumber };
