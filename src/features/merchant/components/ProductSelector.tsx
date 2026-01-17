import { useState, useEffect } from "react";
import { ShoppingBag, Plus, Minus, X, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StockItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number | null;
  image_url?: string | null;
  unit?: string;
}

interface SelectedProduct {
  stockId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string | null;
}

interface ProductSelectorProps {
  stocks: StockItem[];
  selectedProducts: SelectedProduct[];
  onProductsChange: (products: SelectedProduct[]) => void;
  isLoading?: boolean;
}

export function ProductSelector({ 
  stocks, 
  selectedProducts, 
  onProductsChange,
  isLoading 
}: ProductSelectorProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true); // Expanded by default

  // Fetch all products from catalogue if no stocks configured
  const { data: allProducts = [] } = useQuery({
    queryKey: ['all-products-catalogue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, unit, image_url')
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60_000,
  });

  // Filter stocks with prices
  const availableStocks = stocks.filter(s => s.unit_price && s.quantity > 0);
  
  // If no stocks configured, create virtual stocks from products with default prices
  const displayStocks: StockItem[] = availableStocks.length > 0 
    ? availableStocks 
    : allProducts.map(p => ({
        id: `virtual-${p.id}`,
        product_id: p.id,
        product_name: p.name,
        quantity: 999, // Unlimited for virtual
        unit_price: 500, // Default price 500 FCFA
        image_url: p.image_url,
        unit: p.unit,
      }));

  const handleAddProduct = (stock: StockItem) => {
    const existing = selectedProducts.find(p => p.stockId === stock.id);
    
    if (existing) {
      // Increase quantity
      const maxQty = stock.quantity;
      if (existing.quantity < maxQty) {
        onProductsChange(
          selectedProducts.map(p => 
            p.stockId === stock.id 
              ? { ...p, quantity: p.quantity + 1 }
              : p
          )
        );
      }
    } else {
      // Add new product
      onProductsChange([
        ...selectedProducts,
        {
          stockId: stock.id,
          productId: stock.product_id,
          productName: stock.product_name,
          quantity: 1,
          unitPrice: stock.unit_price || 0,
          imageUrl: stock.image_url
        }
      ]);
    }
  };

  const handleRemoveProduct = (stockId: string) => {
    const existing = selectedProducts.find(p => p.stockId === stockId);
    
    if (existing && existing.quantity > 1) {
      onProductsChange(
        selectedProducts.map(p => 
          p.stockId === stockId 
            ? { ...p, quantity: p.quantity - 1 }
            : p
        )
      );
    } else {
      onProductsChange(selectedProducts.filter(p => p.stockId !== stockId));
    }
  };

  const handleClearProduct = (stockId: string) => {
    onProductsChange(selectedProducts.filter(p => p.stockId !== stockId));
  };

  const totalAmount = selectedProducts.reduce(
    (sum, p) => sum + (p.quantity * p.unitPrice), 
    0
  );

  const selectedCount = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);

  if (isLoading) {
    return (
      <div className="bg-muted/30 rounded-2xl p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Always show - use displayStocks (either merchant stocks or all products)
  if (displayStocks.length === 0) {
    return (
      <div className="bg-muted/30 rounded-2xl p-4 text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Aucun produit disponible. Configurez votre stock dans "Mes Stocks".
        </p>
      </div>
    );
  }

  const hasNoMerchantStocks = availableStocks.length === 0;

  return (
    <div className="bg-muted/30 rounded-2xl p-3 space-y-3">
      {/* Header with toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">
            {t("what_are_you_selling") || "Que vendez-vous ?"}
          </span>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {selectedCount} {t("items") || "article(s)"}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {isExpanded ? "▲" : "▼"}
        </span>
      </button>

      {/* Selected products summary (always visible if any) */}
      {selectedProducts.length > 0 && !isExpanded && (
        <div className="flex flex-wrap gap-1.5">
          {selectedProducts.map(product => (
            <Badge 
              key={product.stockId}
              variant="outline"
              className="flex items-center gap-1 pr-1 bg-background"
            >
              <span className="text-xs">
                {product.quantity}x {product.productName}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearProduct(product.stockId);
                }}
                className="ml-1 p-0.5 hover:bg-destructive/20 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <span className="text-xs font-bold text-primary self-center">
            = {totalAmount.toLocaleString("fr-FR")} FCFA
          </span>
        </div>
      )}

      {/* Expanded product grid */}
      {isExpanded && (
        <div className="space-y-3 animate-fade-in">
          {/* Warning if using default catalogue */}
          {hasNoMerchantStocks && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-xs text-amber-700 dark:text-amber-300">
                Mode catalogue. Configurez vos stocks pour des prix personnalisés.
              </span>
            </div>
          )}
          
          {/* Product grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {displayStocks.map(stock => {
              const selected = selectedProducts.find(p => p.stockId === stock.id);
              const quantity = selected?.quantity || 0;
              
              return (
                <div
                  key={stock.id}
                  className={`
                    relative flex flex-col items-center p-2 rounded-xl border-2 transition-all
                    ${quantity > 0 
                      ? "border-primary bg-primary/5" 
                      : "border-border/50 bg-background hover:border-border"
                    }
                  `}
                >
                  {/* Product image or icon */}
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-1 overflow-hidden">
                    {stock.image_url ? (
                      <img 
                        src={stock.image_url} 
                        alt={stock.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Product name */}
                  <span className="text-[10px] font-medium text-center line-clamp-1 w-full">
                    {stock.product_name}
                  </span>
                  
                  {/* Price */}
                  <span className="text-[10px] text-muted-foreground">
                    {stock.unit_price?.toLocaleString("fr-FR")} F
                  </span>

                  {/* Quantity controls */}
                  {quantity > 0 ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => handleRemoveProduct(stock.id)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-bold w-5 text-center">{quantity}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => handleAddProduct(stock)}
                        disabled={quantity >= stock.quantity}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 mt-1 text-xs"
                      onClick={() => handleAddProduct(stock)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {t("add") || "Ajouter"}
                    </Button>
                  )}

                  {/* Quantity badge */}
                  {quantity > 0 && (
                    <Badge 
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                    >
                      {quantity}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total */}
          {selectedProducts.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {t("total") || "Total"} ({selectedCount} {t("items") || "article(s)"})
              </span>
              <span className="text-lg font-bold text-primary">
                {totalAmount.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { SelectedProduct, StockItem };
