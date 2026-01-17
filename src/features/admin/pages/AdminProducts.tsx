/**
 * Page d'administration des produits
 * Permet de gérer les images des produits du catalogue
 */

import React, { useState, useMemo } from 'react';
import { Package, Image, Award } from 'lucide-react';
import {
  LoadingState,
  EmptyState,
  EnhancedHeader,
  PageHero,
  FilterChips,
  SearchInput,
  UnifiedBottomNav,
} from '@/shared/ui';
import { adminSecondaryNavItems } from '@/config/navigation';
import { useAdminProducts } from '../hooks/useAdminProducts';
import { ProductsList, ProductEditDialog } from '../components/products';
import { ProductWithCategory } from '../services/productsService';

const AdminProducts: React.FC = () => {
  const {
    products,
    categories,
    stats,
    isLoading,
    isUploading,
    uploadImage,
    deleteImage,
  } = useAdminProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);

  // Options de filtre par catégorie
  const categoryOptions = useMemo(() => {
    const options = [
      { value: 'all', label: `Tous (${products.length})` },
      { value: 'no-image', label: `Sans image (${stats.total - stats.withImage})` },
    ];

    categories.forEach((cat) => {
      const count = products.filter((p) => p.category?.id === cat.id).length;
      if (count > 0) {
        options.push({ value: cat.id, label: `${cat.name} (${count})` });
      }
    });

    return options;
  }, [products, categories, stats]);

  // Filtrage des produits
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category?.name.toLowerCase().includes(query) ||
          p.origin_region?.toLowerCase().includes(query)
      );
    }

    // Filtre par catégorie
    if (selectedCategory === 'no-image') {
      result = result.filter((p) => !p.image_url);
    } else if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category?.id === selectedCategory);
    }

    return result;
  }, [products, searchQuery, selectedCategory]);

  const handleUpload = async (productId: string, file: File) => {
    await uploadImage(productId, file);
    setEditingProduct(null);
  };

  const handleDelete = async (productId: string) => {
    await deleteImage(productId);
  };

  if (isLoading) {
    return <LoadingState message="Chargement des produits..." />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <EnhancedHeader
        title="Gestion Produits"
        showBack
        backTo="/admin"
      />

      <PageHero
        icon={Package}
        title="Catalogue Produits"
        subtitle="Gérez les images du catalogue"
        variant="accent"
      >
        {/* Statistiques */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">
              {stats.withImage}/{stats.total}
            </span>
            <span className="text-sm text-muted-foreground">avec image</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{stats.igp}</span>
            <span className="text-sm text-muted-foreground">IGP</span>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full max-w-xs mx-auto mb-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${stats.total > 0 ? (stats.withImage / stats.total) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">
            {Math.round(stats.total > 0 ? (stats.withImage / stats.total) * 100 : 0)}% des produits ont une image
          </p>
        </div>

        {/* Recherche */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher un produit..."
          className="mb-4"
        />

        {/* Filtres catégories */}
        <FilterChips
          options={categoryOptions}
          value={selectedCategory}
          onChange={setSelectedCategory}
        />
      </PageHero>

      {/* Liste des produits */}
      <div className="px-4 py-4 max-w-4xl mx-auto">
        {filteredProducts.length === 0 ? (
          <EmptyState
            Icon={Package}
            title="Aucun produit"
            message={
              searchQuery || selectedCategory !== 'all'
                ? 'Aucun produit ne correspond aux filtres'
                : 'Aucun produit dans le catalogue'
            }
          />
        ) : (
          <ProductsList
            products={filteredProducts}
            onEditProduct={setEditingProduct}
          />
        )}
      </div>

      {/* Dialog d'édition */}
      <ProductEditDialog
        product={editingProduct}
        isOpen={!!editingProduct}
        isUploading={isUploading}
        onClose={() => setEditingProduct(null)}
        onUpload={handleUpload}
        onDelete={handleDelete}
      />

      <UnifiedBottomNav items={adminSecondaryNavItems} />
    </div>
  );
};

export default AdminProducts;
