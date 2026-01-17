/**
 * Composant d'upload d'image produit avec drag-and-drop
 */

import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductImageUploaderProps {
  currentImageUrl: string | null;
  productName: string;
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE_MB = 5;

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  currentImageUrl,
  productName,
  isUploading,
  onUpload,
  onDelete,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Format non supporté. Utilisez PNG, JPG ou WebP.';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Fichier trop volumineux. Maximum ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    // Créer preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      await onUpload(file);
      setPreviewUrl(null);
    } catch {
      setPreviewUrl(null);
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDelete = async () => {
    if (confirm('Supprimer cette image ?')) {
      await onDelete();
    }
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="space-y-4">
      {/* Zone d'affichage / drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative aspect-square rounded-xl border-2 border-dashed transition-all overflow-hidden',
          isDragOver
            ? 'border-primary bg-primary/5'
            : displayUrl
            ? 'border-transparent'
            : 'border-muted-foreground/25 hover:border-primary/50',
          isUploading && 'opacity-50 pointer-events-none'
        )}
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt={productName}
              className="w-full h-full object-cover"
            />
            {/* Overlay sur hover */}
            {!isUploading && (
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <Button size="sm" variant="secondary" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Changer
                    </span>
                  </Button>
                </label>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <X className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            )}
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center h-full gap-3 text-center p-4">
            <input
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleInputChange}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              {isDragOver ? (
                <Upload className="h-8 w-8 text-primary" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragOver ? 'Déposez ici' : 'Ajouter une image'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG ou WebP • Max {MAX_SIZE_MB}MB
              </p>
            </div>
          </label>
        )}

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-xs text-center text-muted-foreground">
        Glissez-déposez une image ou cliquez pour sélectionner
      </p>
    </div>
  );
};
