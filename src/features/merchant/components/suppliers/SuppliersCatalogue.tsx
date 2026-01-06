// ============================================
// Component - Suppliers Catalogue Tab
// ============================================

import { Input } from "@/components/ui/input";
import { CategoryCarousel } from "@/features/public/components/market/CategoryCarousel";
import { ProductGrid } from "@/features/public/components/market/ProductGrid";
import { Search } from "lucide-react";
import type { CategoryWithCount, Product } from "../../types/suppliers.types";

interface SuppliersCatalogueProps {
  categories: CategoryWithCount[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export function SuppliersCatalogue({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  products,
  onSelectProduct,
}: SuppliersCatalogueProps) {
  return (
    <div className="space-y-4">
      {/* Category Carousel */}
      <CategoryCarousel
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="🔍 Rechercher un produit..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 h-12 text-base rounded-xl"
        />
      </div>

      {/* Product Grid */}
      <ProductGrid products={products} onSelectProduct={onSelectProduct} />
    </div>
  );
}
