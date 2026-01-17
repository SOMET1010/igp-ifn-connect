/**
 * Hook pour la gestion des produits admin
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { adminLogger } from '@/infra/logger';
import {
  productsService,
  ProductWithCategory,
  ProductCategory,
} from '../services/productsService';

export interface ProductStats {
  total: number;
  withImage: number;
  igp: number;
}

export function useAdminProducts() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [stats, setStats] = useState<ProductStats>({ total: 0, withImage: 0, igp: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData, statsData] = await Promise.all([
        productsService.getProducts(),
        productsService.getCategories(),
        productsService.getProductStats(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      adminLogger.error('Error fetching products data', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const uploadImage = useCallback(async (productId: string, file: File) => {
    setIsUploading(true);
    try {
      const newUrl = await productsService.uploadProductImage(productId, file);
      
      // Mettre à jour localement
      setProducts(prev =>
        prev.map(p =>
          p.id === productId ? { ...p, image_url: newUrl } : p
        )
      );
      
      // Recalculer les stats
      setStats(prev => ({
        ...prev,
        withImage: prev.withImage + 1,
      }));

      toast.success('Image uploadée avec succès');
      return newUrl;
    } catch (error) {
      adminLogger.error('Error uploading image', error);
      toast.error("Erreur lors de l'upload de l'image");
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const deleteImage = useCallback(async (productId: string) => {
    setIsUploading(true);
    try {
      await productsService.deleteProductImage(productId);
      
      // Mettre à jour localement
      setProducts(prev =>
        prev.map(p =>
          p.id === productId ? { ...p, image_url: null } : p
        )
      );
      
      // Recalculer les stats
      setStats(prev => ({
        ...prev,
        withImage: Math.max(0, prev.withImage - 1),
      }));

      toast.success('Image supprimée');
    } catch (error) {
      adminLogger.error('Error deleting image', error);
      toast.error("Erreur lors de la suppression de l'image");
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    products,
    categories,
    stats,
    isLoading,
    isUploading,
    fetchData,
    uploadImage,
    deleteImage,
  };
}
