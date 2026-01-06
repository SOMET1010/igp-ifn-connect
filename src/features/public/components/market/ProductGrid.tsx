import { ProductCard } from "./ProductCard";
import { Package } from "lucide-react";

interface ProductOffer {
  stockId: string;
  cooperativeId: string;
  cooperativeName: string;
  price: number;
  quantity: number;
  distance?: number;
}

interface Product {
  id: string;
  name: string;
  unit: string;
  isIgp?: boolean;
  imageUrl?: string | null;
  categoryId?: string | null;
  offers: ProductOffer[];
}

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export function ProductGrid({ products, onSelectProduct }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">
          Aucun produit trouvé
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Essayez une autre catégorie
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {products.map((product) => {
        // Calculate lowest price and nearest distance
        const lowestPrice = product.offers.length > 0 
          ? Math.min(...product.offers.map(o => o.price))
          : undefined;
        
        const nearestDistance = product.offers.length > 0 && product.offers.some(o => o.distance !== undefined)
          ? Math.min(...product.offers.filter(o => o.distance !== undefined).map(o => o.distance!))
          : undefined;

        return (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            unit={product.unit}
            isIgp={product.isIgp}
            imageUrl={product.imageUrl}
            lowestPrice={lowestPrice}
            offersCount={product.offers.length}
            distance={nearestDistance}
            onSelect={() => onSelectProduct(product)}
          />
        );
      })}
    </div>
  );
}

export type { Product, ProductOffer };
