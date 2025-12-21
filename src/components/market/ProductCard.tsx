import { Badge } from "@/components/ui/badge";
import { Leaf, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Mapping produit → emoji placeholder
const PRODUCT_EMOJIS: Record<string, string> = {
  "tomate": "🍅",
  "attiéké": "🥣",
  "maïs": "🌽",
  "riz": "🍚",
  "cacao": "🫘",
  "café": "☕",
  "banane": "🍌",
  "plantain": "🍌",
  "igname": "🥔",
  "manioc": "🥔",
  "huile": "🫒",
  "arachide": "🥜",
  "haricot": "🫘",
  "oignon": "🧅",
  "piment": "🌶️",
  "aubergine": "🍆",
  "gombo": "🥒",
  "poisson": "🐟",
  "poulet": "🍗",
  "viande": "🥩",
  "orange": "🍊",
  "mangue": "🥭",
  "ananas": "🍍",
  "papaye": "🥭",
  "avocat": "🥑",
  "noix de coco": "🥥",
  "gingembre": "🫚",
  "ail": "🧄",
};

function getProductEmoji(productName: string): string {
  const nameLower = productName.toLowerCase();
  for (const [key, emoji] of Object.entries(PRODUCT_EMOJIS)) {
    if (nameLower.includes(key)) {
      return emoji;
    }
  }
  return "🥬"; // Default veggie emoji
}

interface ProductCardProps {
  id: string;
  name: string;
  unit: string;
  isIgp?: boolean;
  imageUrl?: string | null;
  lowestPrice?: number;
  offersCount: number;
  distance?: number; // in km
  onSelect: () => void;
}

export function ProductCard({
  name,
  unit,
  isIgp,
  imageUrl,
  lowestPrice,
  offersCount,
  distance,
  onSelect,
}: ProductCardProps) {
  const emoji = getProductEmoji(name);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center p-3 rounded-2xl",
        "bg-card border-2 border-border shadow-sm",
        "hover:shadow-lg hover:border-primary/50 hover:-translate-y-1",
        "active:scale-95 transition-all duration-200",
        "min-h-[160px] w-full"
      )}
    >
      {/* IGP Badge */}
      {isIgp && (
        <Badge className="absolute top-2 right-2 bg-green-600 text-white text-[10px] px-1.5 py-0.5">
          <Leaf className="h-2.5 w-2.5 mr-0.5" />
          IGP
        </Badge>
      )}

      {/* Product Image/Emoji - 80x80px minimum */}
      <div className="w-20 h-20 rounded-xl bg-muted/50 flex items-center justify-center mb-2 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl" role="img" aria-label={name}>
            {emoji}
          </span>
        )}
      </div>

      {/* Product Name */}
      <h3 className="font-semibold text-sm text-center line-clamp-2 mb-1">
        {name}
      </h3>

      {/* Offers Count */}
      <p className="text-xs text-muted-foreground mb-1">
        {offersCount} offre{offersCount > 1 ? 's' : ''}
      </p>

      {/* Price Info */}
      {lowestPrice !== undefined && lowestPrice > 0 && (
        <p className="text-sm font-bold text-primary">
          dès {lowestPrice.toLocaleString()} F/{unit}
        </p>
      )}

      {/* Distance */}
      {distance !== undefined && (
        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-1">
          <MapPin className="h-2.5 w-2.5" />
          {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}
        </p>
      )}
    </button>
  );
}
