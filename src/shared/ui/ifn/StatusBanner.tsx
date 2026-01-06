import { cn } from "@/shared/lib";
import { Wifi, WifiOff } from "lucide-react";

interface StatusBannerProps {
  isOnline?: boolean;
  message?: string;
  className?: string;
}

const StatusBanner = ({ 
  isOnline = true, 
  message,
  className 
}: StatusBannerProps) => {
  const defaultMessage = isOnline 
    ? "📶 Tout est sauvegardé" 
    : "📴 Hors ligne - On garde tout";

  return (
    <div className={cn(
      "flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium",
      isOnline 
        ? "bg-[hsl(142,76%,36%)]/10 text-[hsl(142,76%,30%)]" 
        : "bg-amber-500/10 text-amber-700",
      className
    )}>
      {isOnline ? (
        <Wifi className="w-4 h-4" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}
      <span>{message || defaultMessage}</span>
    </div>
  );
};

export { StatusBanner };
