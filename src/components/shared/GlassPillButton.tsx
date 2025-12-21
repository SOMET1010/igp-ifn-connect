import { cn } from "@/lib/utils";

interface GlassPillButtonProps {
  label: string;
  logoSrc?: string;
  alt?: string;
  onClick?: () => void;
  className?: string;
}

export function GlassPillButton({
  label,
  logoSrc,
  alt,
  onClick,
  className,
}: GlassPillButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-3 rounded-full px-5 py-3",
        "border border-white/20 bg-white/10 text-white backdrop-blur-md shadow-lg",
        "hover:bg-white/20 active:scale-95 transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        className
      )}
    >
      <span className="font-semibold text-sm">{label}</span>
      {logoSrc && (
        <img src={logoSrc} alt={alt ?? ""} className="h-6 w-auto" />
      )}
    </button>
  );
}
