/**
 * Liste des produits en grille avec aperçu d'image
 */

import React from 'react';
import { Package, Edit2, Award, ImageOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedList, AnimatedListItem } from '@/shared/ui';
import { ProductWithCategory } from '../../services/productsService';
import { cn } from '@/lib/utils';

interface ProductsListProps {
  products: ProductWithCategory[];
  onEditProduct: (product: ProductWithCategory) => void;
}

export const ProductsList: React.FC<ProductsListProps> = ({
  products,
  onEditProduct,
}) => {
  return (
    <AnimatedList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {products.map((product) => (
        <AnimatedListItem key={product.id}>
          <Card
            className={cn(
              'group cursor-pointer transition-all hover:shadow-md',
              !product.image_url && 'border-dashed border-muted-foreground/30'
            )}
            onClick={() => onEditProduct(product)}
          >
            <CardContent className="p-0">
              {/* Zone image */}
              <div className="relative aspect-square bg-muted/30 rounded-t-lg overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                    <ImageOff className="h-8 w-8" />
                    <span className="text-xs">Pas d'image</span>
                  </div>
                )}

                {/* Badge IGP */}
                {product.is_igp && (
                  <Badge
                    variant="default"
                    className="absolute top-2 right-2 text-xs gap-1"
                  >
                    <Award className="h-3 w-3" />
                    IGP
                  </Badge>
                )}

                {/* Overlay hover avec bouton éditer */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
              </div>

              {/* Infos produit */}
              <div className="p-3 space-y-1">
                <h3 className="font-medium text-sm line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Package className="h-3 w-3" />
                  <span>{product.unit}</span>
                  {product.category && (
                    <>
                      <span>•</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: product.category.color
                            ? `${product.category.color}20`
                            : undefined,
                          color: product.category.color || undefined,
                        }}
                      >
                        {product.category.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedListItem>
      ))}
    </AnimatedList>
  );
};
