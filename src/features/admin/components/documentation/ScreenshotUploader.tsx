/**
 * Composant d'upload de capture d'écran
 */

import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScreenshotUploaderProps {
  pageId: string;
  screenshot?: string;
  onUpload: (pageId: string, base64: string) => void;
  onRemove: (pageId: string) => void;
}

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  pageId,
  screenshot,
  onUpload,
  onRemove,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const processImage = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Redimensionner si nécessaire (max 800px largeur)
          const maxWidth = 800;
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compresser en JPEG 0.7
            const base64 = canvas.toDataURL('image/jpeg', 0.7);
            resolve(base64);
          } else {
            reject(new Error('Impossible de créer le contexte canvas'));
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image (PNG, JPG, WEBP)');
      return;
    }

    try {
      const base64 = await processImage(file);
      onUpload(pageId, base64);
    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      alert('Erreur lors du traitement de l\'image');
    }
  }, [pageId, onUpload, processImage]);

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

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  if (screenshot) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-border">
        <img 
          src={screenshot} 
          alt="Capture d'écran" 
          className="w-full h-auto max-h-48 object-contain bg-muted"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={() => onRemove(pageId)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
        isDragOver 
          ? "border-primary bg-primary/5" 
          : "border-muted-foreground/25 hover:border-primary/50"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileInput}
        className="hidden"
        id={`screenshot-${pageId}`}
      />
      <label 
        htmlFor={`screenshot-${pageId}`}
        className="cursor-pointer flex flex-col items-center gap-2"
      >
        <div className="p-3 rounded-full bg-muted">
          {isDragOver ? (
            <ImageIcon className="h-6 w-6 text-primary" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Cliquez</span> ou glissez une image
        </div>
        <div className="text-xs text-muted-foreground">
          PNG, JPG, WEBP (max 800px)
        </div>
      </label>
    </div>
  );
};
