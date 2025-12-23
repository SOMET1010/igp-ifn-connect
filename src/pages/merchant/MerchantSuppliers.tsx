import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { merchantNavItems } from "@/config/navigation";
import { CategoryCarousel } from "@/components/market/CategoryCarousel";
import { ProductGrid, type Product, type ProductOffer } from "@/components/market/ProductGrid";
import { PriceCompareSheet } from "@/components/market/PriceCompareSheet";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateDistance } from "@/lib/geoUtils";
import { 
  Search, ShoppingCart, Package, Truck, 
  CheckCircle, XCircle, Clock, Plus, Minus, Trash2, Leaf
} from "lucide-react";
import { UnifiedHeader } from "@/components/shared/UnifiedHeader";

interface CartItem {
  cooperativeId: string;
  cooperativeName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  stockId: string;
  maxQuantity: number;
}

interface Order {
  id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  delivery_date: string | null;
  created_at: string;
  notes: string | null;
  cooperatives: { name: string };
  products: { name: string; unit: string };
}

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

interface Cooperative {
  id: string;
  name: string;
  region: string;
  commune: string;
  ifn_certified?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}


const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  pending: { label: 'En attente', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Confirmée', color: 'bg-blue-500', icon: CheckCircle },
  in_transit: { label: 'En livraison', color: 'bg-orange-500', icon: Truck },
  delivered: { label: 'Livrée', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: 'bg-red-500', icon: XCircle },
};

export default function MerchantSuppliers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('catalogue');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Default to Abidjan if location not available
          setUserLocation({ lat: 5.3599517, lng: -4.0082563 });
        }
      );
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMerchantId();
    }
  }, [user]);

  useEffect(() => {
    if (merchantId) {
      fetchData();
    }
  }, [merchantId, userLocation]);

  const fetchMerchantId = async () => {
    const { data } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', user?.id)
      .single();
    
    if (data) {
      setMerchantId(data.id);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchCategoriesAndProducts(), fetchOrders()]);
    setLoading(false);
  };

  const fetchCategoriesAndProducts = async () => {
    // Fetch categories
    const { data: categoriesData } = await supabase
      .from('product_categories')
      .select('id, name, icon, color');
    
    if (categoriesData) {
      setCategories(categoriesData);
    }

    // Fetch cooperatives with location
    const { data: coopsData } = await supabase
      .from('cooperatives')
      .select('id, name, region, commune, latitude, longitude');

    if (coopsData) {
      setCooperatives(coopsData);
    }

    // Fetch all products with stocks
    const { data: productsData } = await supabase
      .from('products')
      .select(`
        id, name, unit, image_url, category_id,
        stocks (
          id, quantity, unit_price, cooperative_id
        )
      `)
      .gt('stocks.quantity', 0);

    if (productsData && coopsData) {
      // Transform products with offers
      const transformedProducts: Product[] = productsData
        .filter((p: any) => p.stocks && p.stocks.length > 0)
        .map((p: any) => {
          const offers: ProductOffer[] = p.stocks.map((stock: any) => {
            const coop = coopsData.find(c => c.id === stock.cooperative_id);
            let distance: number | undefined;
            
            if (userLocation && coop?.latitude && coop?.longitude) {
              distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                Number(coop.latitude),
                Number(coop.longitude)
              );
            }

            return {
              stockId: stock.id,
              cooperativeId: stock.cooperative_id,
              cooperativeName: coop?.name || 'Coopérative',
              price: stock.unit_price || 0,
              quantity: stock.quantity,
              distance,
            };
          });

          return {
            id: p.id,
            name: p.name,
            unit: p.unit,
            isIfn: true,
            imageUrl: p.image_url,
            categoryId: p.category_id,
            offers,
          };
        });

      setProducts(transformedProducts);
    }
  };

  const fetchOrders = async () => {
    if (!merchantId) return;
    
    const { data } = await supabase
      .from('orders')
      .select(`
        id, quantity, unit_price, total_amount, status, delivery_date, created_at, notes,
        cooperatives (name),
        products (name, unit)
      `)
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data as Order[]);
    }
  };

  const addToCart = (offer: ProductOffer, quantity: number) => {
    const product = selectedProduct;
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.stockId === offer.stockId);

    if (existingIndex >= 0) {
      const newCart = [...cart];
      const newQty = Math.min(newCart[existingIndex].quantity + quantity, offer.quantity);
      newCart[existingIndex].quantity = newQty;
      setCart(newCart);
    } else {
      setCart([...cart, {
        cooperativeId: offer.cooperativeId,
        cooperativeName: offer.cooperativeName,
        productId: product.id,
        productName: product.name,
        quantity: Math.min(quantity, offer.quantity),
        unitPrice: offer.price,
        unit: product.unit,
        stockId: offer.stockId,
        maxQuantity: offer.quantity,
      }]);
    }
    
    toast.success(`${product.name} ajouté au panier`);
  };

  const updateCartQuantity = (stockId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.stockId === stockId) {
        const newQty = Math.max(1, Math.min(item.quantity + delta, item.maxQuantity));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (stockId: string) => {
    setCart(cart.filter(item => item.stockId !== stockId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const submitOrders = async () => {
    if (!merchantId || cart.length === 0) return;
    
    setSubmitting(true);
    
    try {
      // Group cart items by cooperative
      const ordersByCooperative: Record<string, CartItem[]> = {};
      cart.forEach(item => {
        if (!ordersByCooperative[item.cooperativeId]) {
          ordersByCooperative[item.cooperativeId] = [];
        }
        ordersByCooperative[item.cooperativeId].push(item);
      });

      // Create orders for each cooperative
      const orderPromises = Object.entries(ordersByCooperative).flatMap(([coopId, items]) =>
        items.map(item => 
          supabase.from('orders').insert({
            merchant_id: merchantId,
            cooperative_id: coopId,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_amount: item.quantity * item.unitPrice,
            status: 'pending',
            delivery_date: deliveryDate || null,
            notes: orderNotes || null,
          })
        )
      );

      await Promise.all(orderPromises);
      
      // Success feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
      
      toast.success('Commandes passées avec succès !');
      setCart([]);
      setShowOrderModal(false);
      setOrderNotes('');
      setDeliveryDate('');
      fetchOrders();
    } catch (error) {
      toast.error('Erreur lors de la commande');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);

    if (!error) {
      toast.success('Commande annulée');
      fetchOrders();
    } else {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Count products per category
  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    productCount: products.filter(p => p.categoryId === cat.id).length
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <UnifiedHeader
        title="Marché Virtuel IFN"
        subtitle="Commandez en 3 clics"
        showBack
        backTo="/marchand"
        rightContent={<Leaf className="h-5 w-5 text-secondary" />}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-2 h-14">
          <TabsTrigger value="catalogue" className="flex items-center gap-2 text-base">
            <span className="text-2xl">🛒</span>
            Catalogue
          </TabsTrigger>
          <TabsTrigger value="commandes" className="flex items-center gap-2 text-base">
            <span className="text-2xl">📦</span>
            Commandes
            {orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                {orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Catalogue Tab */}
        <TabsContent value="catalogue" className="mt-4 space-y-4">
          {/* Category Carousel */}
          <CategoryCarousel
            categories={categoriesWithCount}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="🔍 Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base rounded-xl"
            />
          </div>

          {/* Product Grid */}
          <ProductGrid
            products={filteredProducts}
            onSelectProduct={setSelectedProduct}
          />
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="commandes" className="mt-4 space-y-4">
          {orders.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <Truck className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Aucune commande passée</p>
              <Button 
                variant="link" 
                onClick={() => setActiveTab('catalogue')}
                className="mt-2"
              >
                Parcourir le catalogue
              </Button>
            </Card>
          ) : (
            orders.map(order => {
              const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{order.products.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.cooperatives.name}
                        </p>
                      </div>
                      <Badge className={`${statusConfig.color} text-white`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between text-sm mt-3 pt-3 border-t">
                      <span className="text-muted-foreground">
                        {order.quantity} {order.products.unit}
                      </span>
                      <span className="font-bold text-lg">
                        {order.total_amount.toLocaleString()} FCFA
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      {order.status === 'pending' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => cancelOrder(order.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Annuler
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-card border-2 border-primary rounded-2xl shadow-2xl p-4 z-40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Mon panier</p>
                <p className="text-xs text-muted-foreground">{cart.length} article{cart.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <p className="text-xl font-bold text-primary">{cartTotal.toLocaleString()} F</p>
          </div>

          {/* Cart Items (collapsed view) */}
          <div className="max-h-32 overflow-y-auto space-y-2 mb-3">
            {cart.map(item => (
              <div key={item.stockId} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.cooperativeName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateCartQuantity(item.stockId, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateCartQuantity(item.stockId, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => removeFromCart(item.stockId)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Validate Button */}
          <Button 
            className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 rounded-xl"
            onClick={() => setShowOrderModal(true)}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Valider la commande
          </Button>
        </div>
      )}

      {/* Order Confirmation Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-3xl">📦</span>
              Confirmer la commande
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="p-4 bg-muted rounded-xl">
              <p className="font-medium mb-2">Récapitulatif</p>
              {cart.map(item => (
                <div key={item.stockId} className="flex justify-between text-sm py-1">
                  <span>{item.quantity} {item.unit} {item.productName}</span>
                  <span className="font-medium">{(item.quantity * item.unitPrice).toLocaleString()} F</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary text-lg">{cartTotal.toLocaleString()} FCFA</span>
              </div>
            </div>

            {/* Delivery Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                Date de livraison souhaitée
              </Label>
              <Input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="h-12 text-base"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="text-xl">📝</span>
                Notes (optionnel)
              </Label>
              <Textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Instructions de livraison..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={submitOrders}
              disabled={submitting}
              className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Confirmer ({cartTotal.toLocaleString()} FCFA)
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowOrderModal(false)}
              className="w-full"
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Detail Sheet */}
      <PriceCompareSheet
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      {/* Bottom Nav */}
      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
