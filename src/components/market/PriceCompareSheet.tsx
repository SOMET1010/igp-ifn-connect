import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuantitySelector } from "./QuantitySelector";
import { MapPin, Leaf, ShoppingCart, Check, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/geoUtils";
import type { Product, ProductOffer } from "./ProductGrid";

// Product emoji mapping
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
  return "🥬";
}

interface PriceCompareSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (offer: ProductOffer, quantity: number) => void;
}

export function PriceCompareSheet({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: PriceCompareSheetProps) {
  const [selectedOffer, setSelectedOffer] = useState<ProductOffer | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedOffers, setAddedOffers] = useState<Set<string>>(new Set());

  if (!product) return null;

  const emoji = getProductEmoji(product.name);
  
  // Sort offers by distance (nearest first), then by price
  const sortedOffers = [...product.offers].sort((a, b) => {
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }
    if (a.distance !== undefined) return -1;
    if (b.distance !== undefined) return 1;
    return a.price - b.price;
  });

  const handleSelectOffer = (offer: ProductOffer) => {
    setSelectedOffer(offer);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedOffer) return;
    
    // Trigger success feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // Play success sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleRwBAAAA');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}
    
    onAddToCart(selectedOffer, quantity);
    setAddedOffers(prev => new Set(prev).add(selectedOffer.stockId));
    setSelectedOffer(null);
    setQuantity(1);
  };

  const handleClose = () => {
    setSelectedOffer(null);
    setQuantity(1);
    setAddedOffers(new Set());
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-center pb-4 border-b">
          {/* Product Header */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span className="text-4xl">{emoji}</span>
              )}
            </div>
            <div className="text-left">
              <SheetTitle className="text-xl flex items-center gap-2">
                {product.name}
                {product.isIgp && (
                  <Badge className="bg-green-600 text-white text-xs">
                    <Leaf className="h-3 w-3 mr-0.5" />
                    IGP
                  </Badge>
                )}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                {product.offers.length} offre{product.offers.length > 1 ? 's' : ''} disponible{product.offers.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-4 overflow-y-auto max-h-[calc(85vh-200px)] pb-4">
          {/* Offer Selection - Step 1 & 2 */}
          {!selectedOffer ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground px-1">
                📍 Choisir un fournisseur
              </h3>
              
              {sortedOffers.map((offer) => {
                const isAdded = addedOffers.has(offer.stockId);
                
                return (
                  <button
                    key={offer.stockId}
                    onClick={() => !isAdded && handleSelectOffer(offer)}
                    disabled={isAdded}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 text-left transition-all",
                      isAdded 
                        ? "bg-green-50 border-green-500 dark:bg-green-950" 
                        : "bg-card border-border hover:border-primary hover:shadow-md active:scale-[0.98]"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{offer.cooperativeName}</span>
                          {isAdded && (
                            <Badge className="bg-green-600 text-white text-xs">
                              <Check className="h-3 w-3 mr-0.5" />
                              Ajouté
                            </Badge>
                          )}
                        </div>
                        
                        {offer.distance !== undefined && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {formatDistance(offer.distance)}
                          </p>
                        )}
                        
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Package className="h-3 w-3" />
                          {offer.quantity} {product.unit} disponibles
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {offer.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          FCFA/{product.unit}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Quantity Selection - Step 2 */
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{selectedOffer.cooperativeName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOffer(null)}
                    className="text-muted-foreground"
                  >
                    Changer
                  </Button>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {selectedOffer.price.toLocaleString()} FCFA/{product.unit}
                </p>
              </div>

              <div className="py-4">
                <h3 className="font-semibold text-center mb-4">
                  🔢 Choisir la quantité
                </h3>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  max={selectedOffer.quantity}
                  unit={product.unit}
                />
              </div>

              {/* Total */}
              <div className="p-4 bg-primary/10 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {(quantity * selectedOffer.price).toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add to Cart Button - Step 3 */}
        {selectedOffer && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
            <Button
              onClick={handleAddToCart}
              className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-700 rounded-2xl"
            >
              <ShoppingCart className="h-6 w-6 mr-3" />
              Ajouter au panier
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
