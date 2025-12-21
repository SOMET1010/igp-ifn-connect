import { cn } from "@/lib/utils";

interface BadgeChipProps {
  children: React.ReactNode;
  className?: string;
}

export function BadgeChip({ children, className }: BadgeChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold",
        "bg-primary text-primary-foreground shadow-lg backdrop-blur-sm",
        "animate-fade-in",
        className
      )}
    >
      {children}
    </span>
  );
}
