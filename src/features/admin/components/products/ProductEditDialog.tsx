/**
 * Dialog de modification d'image produit
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ProductImageUploader } from './ProductImageUploader';
import { ProductWithCategory } from '../../services/productsService';

interface ProductEditDialogProps {
  product: ProductWithCategory | null;
  isOpen: boolean;
  isUploading: boolean;
  onClose: () => void;
  onUpload: (productId: string, file: File) => Promise<void>;
  onDelete: (productId: string) => Promise<void>;
}

export const ProductEditDialog: React.FC<ProductEditDialogProps> = ({
  product,
  isOpen,
  isUploading,
  onClose,
  onUpload,
  onDelete,
}) => {
  if (!product) return null;

  const handleUpload = async (file: File) => {
    await onUpload(product.id, file);
  };

  const handleDelete = async () => {
    await onDelete(product.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.name}
            {product.is_igp && (
              <Badge variant="default" className="text-xs">IGP</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {product.category?.name || 'Sans catégorie'}
            {product.origin_region && ` • ${product.origin_region}`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ProductImageUploader
            currentImageUrl={product.image_url}
            productName={product.name}
            isUploading={isUploading}
            onUpload={handleUpload}
            onDelete={handleDelete}
          />
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Unité de mesure : <strong>{product.unit}</strong>
        </div>
      </DialogContent>
    </Dialog>
  );
};
