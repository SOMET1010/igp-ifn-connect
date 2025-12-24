// ============================================
// Hook - useMerchantSuppliers
// ============================================

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { suppliersService } from "../services/suppliersService";
import type {
  Category,
  CategoryWithCount,
  Cooperative,
  Product,
  SupplierOrder,
  UserLocation,
} from "../types/suppliers.types";

interface UseMerchantSuppliersReturn {
  // Data
  categories: CategoryWithCount[];
  products: Product[];
  orders: SupplierOrder[];
  merchantId: string | null;
  userLocation: UserLocation | null;
  
  // State
  loading: boolean;
  
  // Filters
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProducts: Product[];
  
  // Selected product
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  
  // Actions
  refetchOrders: () => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  
  // Pending orders count
  pendingOrdersCount: number;
}

export function useMerchantSuppliers(): UseMerchantSuppliersReturn {
  const { user } = useAuth();

  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Abidjan if location not available
          setUserLocation({ lat: 5.3599517, lng: -4.0082563 });
        }
      );
    }
  }, []);

  // Fetch merchant ID
  useEffect(() => {
    if (user?.id) {
      suppliersService.getMerchantId(user.id).then(setMerchantId);
    }
  }, [user?.id]);

  // Fetch all data
  useEffect(() => {
    if (!merchantId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, coops] = await Promise.all([
          suppliersService.fetchCategories(),
          suppliersService.fetchCooperatives(),
        ]);
        
        setCategories(cats);
        setCooperatives(coops);
        
        const [prods, ords] = await Promise.all([
          suppliersService.fetchProducts(coops, userLocation),
          suppliersService.fetchOrders(merchantId),
        ]);
        
        setProducts(prods);
        setOrders(ords);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [merchantId, userLocation]);

  // Refetch orders
  const refetchOrders = useCallback(async () => {
    if (!merchantId) return;
    const ords = await suppliersService.fetchOrders(merchantId);
    setOrders(ords);
  }, [merchantId]);

  // Cancel order
  const cancelOrder = useCallback(async (orderId: string) => {
    const success = await suppliersService.cancelOrder(orderId);
    if (success) {
      toast.success("Commande annulée");
      refetchOrders();
    } else {
      toast.error("Erreur lors de l'annulation");
    }
  }, [refetchOrders]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categories with product count
  const categoriesWithCount: CategoryWithCount[] = categories.map((cat) => ({
    ...cat,
    productCount: products.filter((p) => p.categoryId === cat.id).length,
  }));

  // Pending orders count
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed"
  ).length;

  return {
    categories: categoriesWithCount,
    products,
    orders,
    merchantId,
    userLocation,
    loading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    selectedProduct,
    setSelectedProduct,
    refetchOrders,
    cancelOrder,
    pendingOrdersCount,
  };
}
