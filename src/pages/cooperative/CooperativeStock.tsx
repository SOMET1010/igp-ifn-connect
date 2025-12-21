import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  Package, 
  Plus, 
  ArrowLeft,
  Home,
  ClipboardList,
  User,
  Loader2,
  Search
} from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: 'Accueil', path: '/cooperative' },
    { icon: Package, label: 'Stock', path: '/cooperative/stock' },
    { icon: ClipboardList, label: 'Commandes', path: '/cooperative/commandes' },
    { icon: User, label: 'Profil', path: '/cooperative/profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-amber-700 bg-amber-100" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

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
  
  // Form state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Get cooperative ID
      const { data: coopData } = await supabase
        .from('cooperatives')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (coopData) {
        setCooperativeId(coopData.id);

        // Fetch stocks with product info
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
          // Fetch product details for each stock
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

      // Fetch all available products
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/cooperative')} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Mon Stock</h1>
            <p className="text-sm text-white/80">{stocks.length} produits en stock</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
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

        {/* Add button */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-amber-600 hover:bg-amber-700">
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
                className="w-full bg-amber-600 hover:bg-amber-700"
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

        {/* Stock list */}
        {filteredStocks.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Aucun stock</h3>
            <p className="text-sm text-muted-foreground">
              Ajoutez vos premiers produits en stock
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredStocks.map((stock) => (
              <Card key={stock.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🌾</span>
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

      <BottomNav />
    </div>
  );
};

export default CooperativeStock;
