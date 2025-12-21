import { cn } from "@/lib/utils";
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
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[hsl(214,70%,9%)] via-[hsl(214,50%,12%)] to-[hsl(214,40%,6%)]" />
        )}
      </div>

      {/* Overlay sombre dégradé */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
      
      {/* Léger blur pour lisibilité */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      {/* Contenu */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
