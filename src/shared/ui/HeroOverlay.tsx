import { cn } from "@/shared/lib";
import { useState } from "react";

interface HeroOverlayProps {
  backgroundImage?: string;
  children: React.ReactNode;
  className?: string;
}

export function HeroOverlay({
  backgroundImage,
  children,
  className,
}: HeroOverlayProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = backgroundImage && !imageError;

  return (
    <div className={cn("relative min-h-screen overflow-hidden", className)}>
      {/* Image de fond ou fallback gradient */}
      <div className="absolute inset-0">
      {showImage ? (
          <img
            src={backgroundImage}
            alt="Marché ivoirien"
            className="object-cover w-full h-full blur-[2px] scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[hsl(214,70%,9%)] via-[hsl(214,50%,12%)] to-[hsl(214,40%,6%)]" />
        )}
      </div>

      {/* Overlay sombre uniforme */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Contenu */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
