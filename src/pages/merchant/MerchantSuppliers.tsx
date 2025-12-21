import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/shared/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowLeft, Search, ShoppingCart, Package, Truck, 
  CheckCircle, XCircle, Clock, MapPin, Plus, Minus,
  Home, CreditCard, Store, User, Leaf
} from "lucide-react";

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

interface StockWithProduct {
  id: string;
  quantity: number;
  unit_price: number;
  cooperative_id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    unit: string;
    is_igp: boolean;
  };
}

interface Cooperative {
  id: string;
  name: string;
  region: string;
  commune: string;
  igp_certified: boolean;
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

const navItems = [
  { icon: Home, label: 'Accueil', href: '/marchand' },
  { icon: CreditCard, label: 'Caisse', href: '/marchand/encaisser' },
  { icon: Store, label: 'Stock', href: '/marchand/stock' },
  { icon: User, label: 'Profil', href: '/marchand/profil' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  pending: { label: 'En attente', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Confirmée', color: 'bg-blue-500', icon: CheckCircle },
  in_transit: { label: 'En livraison', color: 'bg-orange-500', icon: Truck },
  delivered: { label: 'Livrée', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: 'bg-red-500', icon: XCircle },
};

const REGIONS = ['Toutes', 'Abidjan', 'Korhogo', 'Bouaké', 'San-Pédro', 'Yamoussoukro', 'Daloa'];

export default function MerchantSuppliers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('catalogue');
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [stocks, setStocks] = useState<Record<string, StockWithProduct[]>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Toutes');
  const [loading, setLoading] = useState(true);
  
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMerchantId();
    }
  }, [user]);

  useEffect(() => {
    if (merchantId) {
      fetchData();
    }
  }, [merchantId]);

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
    await Promise.all([fetchCooperativesAndStocks(), fetchOrders()]);
    setLoading(false);
  };

  const fetchCooperativesAndStocks = async () => {
    // Fetch IGP cooperatives
    const { data: coopsData } = await supabase
      .from('cooperatives')
      .select('id, name, region, commune, igp_certified')
      .eq('igp_certified', true);

    if (coopsData) {
      setCooperatives(coopsData);
      
      // Fetch stocks for all cooperatives
      const { data: stocksData } = await supabase
        .from('stocks')
        .select(`
          id, quantity, unit_price, cooperative_id, product_id,
          products (id, name, unit, is_igp)
        `)
        .in('cooperative_id', coopsData.map(c => c.id))
        .gt('quantity', 0);

      if (stocksData) {
        // Group stocks by cooperative
        const stocksByCooperative: Record<string, StockWithProduct[]> = {};
        stocksData.forEach((stock: any) => {
          if (!stocksByCooperative[stock.cooperative_id]) {
            stocksByCooperative[stock.cooperative_id] = [];
          }
          stocksByCooperative[stock.cooperative_id].push(stock);
        });
        setStocks(stocksByCooperative);
      }
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

  const addToCart = (cooperative: Cooperative, stock: StockWithProduct, quantity: number) => {
    const existingIndex = cart.findIndex(
      item => item.stockId === stock.id
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      const newQty = Math.min(newCart[existingIndex].quantity + quantity, stock.quantity);
      newCart[existingIndex].quantity = newQty;
      setCart(newCart);
    } else {
      setCart([...cart, {
        cooperativeId: cooperative.id,
        cooperativeName: cooperative.name,
        productId: stock.product_id,
        productName: stock.products.name,
        quantity: Math.min(quantity, stock.quantity),
        unitPrice: stock.unit_price || 0,
        unit: stock.products.unit,
        stockId: stock.id,
        maxQuantity: stock.quantity,
      }]);
    }
    
    toast.success(`${stock.products.name} ajouté au panier`);
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

  const filteredCooperatives = cooperatives.filter(coop => {
    const matchesSearch = coop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stocks[coop.id]?.some(s => s.products.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRegion = selectedRegion === 'Toutes' || coop.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
        <div className="flex items-center gap-3 mb-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/marchand')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Fournisseurs IGP
            </h1>
            <p className="text-sm text-white/80">Commandez directement aux coopératives</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="catalogue" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Catalogue
          </TabsTrigger>
          <TabsTrigger value="commandes" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Mes commandes
            {orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Catalogue Tab */}
        <TabsContent value="catalogue" className="mt-4 space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cooperatives List */}
          {filteredCooperatives.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Aucune coopérative trouvée</p>
            </Card>
          ) : (
            filteredCooperatives.map(coop => (
              <Card key={coop.id} className="overflow-hidden">
                <CardHeader className="pb-2 bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {coop.name}
                        {coop.igp_certified && (
                          <Badge className="bg-green-600 text-white text-xs">
                            <Leaf className="h-3 w-3 mr-1" />
                            IGP
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {coop.commune}, {coop.region}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-3">
                  {stocks[coop.id]?.length > 0 ? (
                    <div className="space-y-3">
                      {stocks[coop.id].map(stock => (
                        <div key={stock.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{stock.products.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {stock.quantity} {stock.products.unit} disponibles • {(stock.unit_price || 0).toLocaleString()} FCFA/{stock.products.unit}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToCart(coop, stock, 1)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun stock disponible
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="commandes" className="mt-4 space-y-4">
          {orders.length === 0 ? (
            <Card className="p-8 text-center">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Aucune commande passée</p>
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
                        <p className="font-semibold text-sm">{order.products.name}</p>
                        <p className="text-xs text-muted-foreground">
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
                      <span className="font-semibold">
                        {order.total_amount.toLocaleString()} FCFA
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>
                        Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      {order.delivery_date && (
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          Livraison: {new Date(order.delivery_date).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    
                    {order.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => cancelOrder(order.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Annuler la commande
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-card border rounded-xl shadow-lg p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span className="font-semibold">{cart.length} article(s)</span>
            </div>
            <span className="font-bold text-lg">{cartTotal.toLocaleString()} FCFA</span>
          </div>
          
          {/* Cart Items Preview */}
          <div className="max-h-32 overflow-y-auto space-y-2 mb-3">
            {cart.map(item => (
              <div key={item.stockId} className="flex items-center justify-between text-sm bg-muted/50 rounded p-2">
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.cooperativeName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => updateCartQuantity(item.stockId, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => updateCartQuantity(item.stockId, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-destructive"
                    onClick={() => removeFromCart(item.stockId)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            onClick={() => setShowOrderModal(true)}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Valider la commande
          </Button>
        </div>
      )}

      {/* Order Confirmation Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer votre commande</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Récapitulatif</p>
              {cart.map(item => (
                <div key={item.stockId} className="flex justify-between text-sm py-1">
                  <span>{item.quantity} × {item.productName}</span>
                  <span>{(item.quantity * item.unitPrice).toLocaleString()} FCFA</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{cartTotal.toLocaleString()} FCFA</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Date de livraison souhaitée</Label>
              <Input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Notes pour le fournisseur (optionnel)</Label>
              <Textarea
                placeholder="Instructions particulières..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderModal(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={submitOrders}
              disabled={submitting}
            >
              {submitting ? 'Envoi...' : 'Confirmer la commande'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav items={navItems} />
    </div>
  );
}
