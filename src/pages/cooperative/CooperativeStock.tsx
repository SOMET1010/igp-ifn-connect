import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Package, 
  Plus, 
  Loader2,
  Search,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { CooperativeBottomNav } from '@/components/cooperative/CooperativeBottomNav';
import { SecondaryPageHeader } from '@/components/shared/SecondaryPageHeader';

interface StockItem {
  id: string;
  quantity: number;
  unit_price: number | null;
  harvest_date: string | null;
  product: {
    id: string;
    name: string;
    unit: string;
  };
}

interface Product {
  id: string;
  name: string;
  unit: string;
}

const CooperativeStock: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cooperativeId, setCooperativeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  
  // Form state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Low stock threshold
  const LOW_STOCK_THRESHOLD = 10;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: coopData } = await supabase
        .from('cooperatives')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (coopData) {
        setCooperativeId(coopData.id);

        const { data: stocksData } = await supabase
          .from('stocks')
          .select(`
            id,
            quantity,
            unit_price,
            harvest_date,
            product_id
          `)
          .eq('cooperative_id', coopData.id);

        if (stocksData) {
          const productIds = stocksData.map(s => s.product_id);
          const { data: productsData } = await supabase
            .from('products')
            .select('id, name, unit')
            .in('id', productIds);

          const stocksWithProducts = stocksData.map(stock => ({
            ...stock,
            product: productsData?.find(p => p.id === stock.product_id) ?? { id: stock.product_id, name: 'Produit', unit: 'kg' }
          }));

          setStocks(stocksWithProducts);
        }
      }

      const { data: allProducts } = await supabase
        .from('products')
        .select('id, name, unit')
        .order('name');
      
      if (allProducts) {
        setProducts(allProducts);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const handleAddStock = async () => {
    if (!selectedProduct || !quantity || !cooperativeId) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSaving(true);

    const { error } = await supabase
      .from('stocks')
      .insert({
        cooperative_id: cooperativeId,
        product_id: selectedProduct,
        quantity: parseFloat(quantity),
        unit_price: unitPrice ? parseFloat(unitPrice) : null,
      });

    if (error) {
      toast.error('Erreur lors de l\'ajout');
      setIsSaving(false);
      return;
    }

    toast.success('Stock ajouté avec succès');
    setIsAddOpen(false);
    setSelectedProduct('');
    setQuantity('');
    setUnitPrice('');
    setIsSaving(false);

    // Refresh stocks
    const { data: stocksData } = await supabase
      .from('stocks')
      .select('id, quantity, unit_price, harvest_date, product_id')
      .eq('cooperative_id', cooperativeId);

    if (stocksData) {
      const productIds = stocksData.map(s => s.product_id);
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, unit')
        .in('id', productIds);

      const stocksWithProducts = stocksData.map(stock => ({
        ...stock,
        product: productsData?.find(p => p.id === stock.product_id) ?? { id: stock.product_id, name: 'Produit', unit: 'kg' }
      }));

      setStocks(stocksWithProducts);
    }
  };

  const filteredStocks = stocks.filter(stock =>
    stock.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = stocks.filter(stock => stock.quantity < LOW_STOCK_THRESHOLD);

  const handleCheckLowStock = async () => {
    setIsCheckingStock(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-low-stock', {
        body: { type: 'cooperative' }
      });
      
      if (error) {
        console.error("Error checking stock:", error);
        toast.error("Erreur lors de la vérification du stock");
      } else {
        if (data?.cooperative?.lowStockCount > 0) {
          toast.info(`${data.cooperative.lowStockCount} produit(s) en stock bas`);
        } else {
          toast.success("Tous les stocks sont OK !");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Erreur de connexion");
    }
    setIsCheckingStock(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <SecondaryPageHeader
        title="Mon Stock"
        subtitle={`${stocks.length} produit${stocks.length !== 1 ? 's' : ''} en stock`}
        onBack={() => navigate('/cooperative')}
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="font-semibold text-foreground">Alertes de stock ({lowStockItems.length})</h3>
              </div>
              <div className="space-y-2">
                {lowStockItems.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-warning/10 rounded-lg p-2">
                    <span className="font-medium text-sm">{item.product.name}</span>
                    <span className="text-sm text-muted-foreground">{item.quantity} {item.product.unit}</span>
                  </div>
                ))}
                {lowStockItems.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{lowStockItems.length - 3} autre(s) produit(s) en stock bas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Plus className="h-5 w-5 mr-2" />
                Ajouter un produit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter au stock</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Produit</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 100"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prix unitaire (FCFA) - optionnel</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 500"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleAddStock}
                  disabled={isSaving || !selectedProduct || !quantity}
                  className="w-full"
                >
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Ajouter'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleCheckLowStock}
            variant="outline"
            disabled={isCheckingStock}
            className="shrink-0"
          >
            {isCheckingStock ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Stock list */}
        {filteredStocks.length === 0 ? (
          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Aucun stock</h3>
              <p className="text-sm text-muted-foreground">
                Ajoutez vos premiers produits en stock
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredStocks.map((stock) => (
              <Card key={stock.id} className="card-institutional hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{stock.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {stock.quantity} {stock.product.unit}
                        {stock.unit_price && ` • ${stock.unit_price.toLocaleString()} FCFA/${stock.product.unit}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CooperativeBottomNav />
    </div>
  );
};

export default CooperativeStock;
