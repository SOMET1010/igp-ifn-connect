/**
 * Service de gestion des produits pour l'admin
 * Gère le CRUD des images produits avec le bucket 'product-images'
 */

import { supabase } from '@/integrations/supabase/client';
import { adminLogger } from '@/infra/logger';

export interface ProductWithCategory {
  id: string;
  name: string;
  unit: string;
  image_url: string | null;
  is_igp: boolean | null;
  origin_region: string | null;
  created_at: string;
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

/**
 * Récupère tous les produits avec leurs catégories
 */
export async function getProducts(): Promise<ProductWithCategory[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      unit,
      image_url,
      is_igp,
      origin_region,
      created_at,
      category:product_categories(id, name, color, icon)
    `)
    .order('name');

  if (error) {
    adminLogger.error('Error fetching products', error);
    throw error;
  }

  return (data || []) as ProductWithCategory[];
}

/**
 * Récupère toutes les catégories de produits
 */
export async function getCategories(): Promise<ProductCategory[]> {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('name');

  if (error) {
    adminLogger.error('Error fetching categories', error);
    throw error;
  }

  return data || [];
}

/**
 * Upload une image produit vers le bucket 'product-images'
 * Retourne l'URL publique de l'image
 */
export async function uploadProductImage(
  productId: string,
  file: File
): Promise<string> {
  // Générer un nom de fichier unique basé sur le product ID
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${productId}.${fileExt}`;

  // Supprimer l'ancienne image si elle existe
  const { data: existingFiles } = await supabase.storage
    .from('product-images')
    .list('', { search: productId });

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles
      .filter(f => f.name.startsWith(productId))
      .map(f => f.name);
    
    if (filesToDelete.length > 0) {
      await supabase.storage
        .from('product-images')
        .remove(filesToDelete);
    }
  }

  // Upload la nouvelle image
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    adminLogger.error('Error uploading product image', uploadError);
    throw uploadError;
  }

  // Récupérer l'URL publique
  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  const publicUrl = urlData.publicUrl;

  // Mettre à jour le produit avec la nouvelle URL
  const { error: updateError } = await supabase
    .from('products')
    .update({ image_url: publicUrl })
    .eq('id', productId);

  if (updateError) {
    adminLogger.error('Error updating product image_url', updateError);
    throw updateError;
  }

  return publicUrl;
}

/**
 * Supprime l'image d'un produit
 */
export async function deleteProductImage(productId: string): Promise<void> {
  // Récupérer l'URL actuelle pour trouver le fichier
  const { data: product } = await supabase
    .from('products')
    .select('image_url')
    .eq('id', productId)
    .single();

  if (product?.image_url) {
    // Extraire le nom du fichier de l'URL
    const url = new URL(product.image_url);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];

    // Supprimer du bucket
    await supabase.storage
      .from('product-images')
      .remove([fileName]);
  }

  // Réinitialiser l'URL dans la base
  const { error } = await supabase
    .from('products')
    .update({ image_url: null })
    .eq('id', productId);

  if (error) {
    adminLogger.error('Error deleting product image', error);
    throw error;
  }
}

/**
 * Récupère les statistiques des produits
 */
export async function getProductStats(): Promise<{
  total: number;
  withImage: number;
  igp: number;
}> {
  const { data, error } = await supabase
    .from('products')
    .select('id, image_url, is_igp');

  if (error) {
    throw error;
  }

  const products = data || [];
  return {
    total: products.length,
    withImage: products.filter(p => p.image_url).length,
    igp: products.filter(p => p.is_igp).length,
  };
}

export const productsService = {
  getProducts,
  getCategories,
  uploadProductImage,
  deleteProductImage,
  getProductStats,
};
