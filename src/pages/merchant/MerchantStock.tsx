import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Package, 
  Plus, 
  AlertTriangle, 
  Loader2,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/shared/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Wallet, User, History } from "lucide-react";

const navItems = [
  { icon: Home, label: "Accueil", href: "/marchand" },
  { icon: Package, label: "Stock", href: "/marchand/stock" },
  { icon: Wallet, label: "Encaisser", href: "/marchand/encaisser" },
  { icon: User, label: "Profil", href: "/marchand/profil" },
];

interface Product {
  id: string;
  name: string;
  unit: string;
  is_ifn?: boolean;
  category_id: string | null;
}

interface StockItem {
  id: string;
  product_id: string;
  quantity: number;
  min_threshold: number;
  unit_price: number | null;
  last_restocked_at: string | null;
  product?: Product;
}

interface ProductCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

type StockStatus = "ok" | "low" | "out";

function getStockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return "out";
  if (quantity <= threshold) return "low";
  return "ok";
}

function getStatusBadge(status: StockStatus) {
  switch (status) {
    case "out":
      return <Badge variant="destructive" className="text-xs">Rupture</Badge>;
    case "low":
      return <Badge className="bg-amber-500 hover:bg-amber-500/80 text-xs">Stock bas</Badge>;
    case "ok":
      return <Badge className="bg-green-500 hover:bg-green-500/80 text-xs">En stock</Badge>;
  }
}

export default function MerchantStock() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minThreshold, setMinThreshold] = useState("5");
  const [unitPrice, setUnitPrice] = useState("");
  const [restockQuantity, setRestockQuantity] = useState("");

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);

    // Get merchant ID
    const { data: merchantData } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!merchantData) {
      setIsLoading(false);
      return;
    }

    setMerchantId(merchantData.id);

    // Fetch stocks with products
    const { data: stocksData } = await supabase
      .from("merchant_stocks")
      .select("*")
      .eq("merchant_id", merchantData.id);

    // Fetch all products
    const { data: productsData } = await supabase
      .from("products")
      .select("*");

    // Fetch categories
    const { data: categoriesData } = await supabase
      .from("product_categories")
      .select("*");

    if (productsData) setProducts(productsData);
    if (categoriesData) setCategories(categoriesData);

    // Merge stocks with product info
    if (stocksData && productsData) {
      const mergedStocks = stocksData.map(stock => ({
        ...stock,
        product: productsData.find(p => p.id === stock.product_id)
      }));
      setStocks(mergedStocks);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const alertCount = stocks.filter(s => {
    const status = getStockStatus(Number(s.quantity), Number(s.min_threshold));
    return status === "out" || status === "low";
  }).length;

  const outOfStockItems = stocks.filter(s => Number(s.quantity) <= 0);
  const lowStockItems = stocks.filter(s => {
    const qty = Number(s.quantity);
    const threshold = Number(s.min_threshold);
    return qty > 0 && qty <= threshold;
  });

  const filteredStocks = stocks.filter(s => 
    s.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableProducts = products.filter(p => 
    !stocks.some(s => s.product_id === p.id)
  );

  const resetForm = () => {
    setSelectedProductId("");
    setQuantity("");
    setMinThreshold("5");
    setUnitPrice("");
    setRestockQuantity("");
    setSelectedStock(null);
  };

  const handleAddProduct = async () => {
    if (!merchantId || !selectedProductId) return;

    setIsSaving(true);

    const { error } = await supabase.from("merchant_stocks").insert({
      merchant_id: merchantId,
      product_id: selectedProductId,
      quantity: parseFloat(quantity) || 0,
      min_threshold: parseFloat(minThreshold) || 5,
      unit_price: unitPrice ? parseFloat(unitPrice) : null,
      last_restocked_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error adding stock:", error);
      toast.error("Erreur lors de l'ajout");
    } else {
      toast.success("Produit ajouté au stock");
      setShowAddDialog(false);
      resetForm();
      fetchData();
    }

    setIsSaving(false);
  };

  const handleRestock = async () => {
    if (!selectedStock) return;

    setIsSaving(true);

    const newQuantity = Number(selectedStock.quantity) + (parseFloat(restockQuantity) || 0);

    const { error } = await supabase
      .from("merchant_stocks")
      .update({
        quantity: newQuantity,
        last_restocked_at: new Date().toISOString(),
      })
      .eq("id", selectedStock.id);

    if (error) {
      console.error("Error restocking:", error);
      toast.error("Erreur lors du réapprovisionnement");
    } else {
      toast.success("Stock mis à jour");
      setShowRestockDialog(false);
      resetForm();
      fetchData();
    }

    setIsSaving(false);
  };

  const handleUpdateStock = async () => {
    if (!selectedStock) return;

    setIsSaving(true);

    const { error } = await supabase
      .from("merchant_stocks")
      .update({
        quantity: parseFloat(quantity) || 0,
        min_threshold: parseFloat(minThreshold) || 5,
        unit_price: unitPrice ? parseFloat(unitPrice) : null,
      })
      .eq("id", selectedStock.id);

    if (error) {
      console.error("Error updating stock:", error);
      toast.error("Erreur lors de la modification");
    } else {
      toast.success("Stock modifié");
      setShowEditDialog(false);
      resetForm();
      fetchData();
    }

    setIsSaving(false);
  };

  const handleDeleteStock = async (stockId: string) => {
    const { error } = await supabase
      .from("merchant_stocks")
      .delete()
      .eq("id", stockId);

    if (error) {
      console.error("Error deleting stock:", error);
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Produit retiré du stock");
      fetchData();
    }
  };

  const openEditDialog = (stock: StockItem) => {
    setSelectedStock(stock);
    setQuantity(String(stock.quantity));
    setMinThreshold(String(stock.min_threshold));
    setUnitPrice(stock.unit_price ? String(stock.unit_price) : "");
    setShowEditDialog(true);
  };

  const openRestockDialog = (stock: StockItem) => {
    setSelectedStock(stock);
    setRestockQuantity("");
    setShowRestockDialog(true);
  };

  const handleCheckLowStock = async () => {
    setIsCheckingStock(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-low-stock');
      
      if (error) {
        console.error("Error checking stock:", error);
        toast.error("Erreur lors de la vérification du stock");
      } else {
        if (data?.lowStockCount > 0) {
          toast.info(`${data.lowStockCount} produit(s) en stock bas détecté(s)`);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/marchand")}
            className="text-secondary-foreground hover:bg-secondary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Mon Stock</h1>
            <p className="text-sm text-secondary-foreground/80">
              {stocks.length} produit{stocks.length !== 1 ? "s" : ""} • {alertCount > 0 && `${alertCount} alerte${alertCount !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchData()}
            className="text-secondary-foreground hover:bg-secondary-foreground/10"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Alerts Section */}
        {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h3 className="font-semibold text-foreground">Alertes de stock</h3>
              </div>
              <div className="space-y-2">
                {outOfStockItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-destructive/10 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔴</span>
                      <span className="font-medium text-sm">{item.product?.name}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openRestockDialog(item)}
                      className="h-7 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Réappro.
                    </Button>
                  </div>
                ))}
                {lowStockItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-amber-500/10 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🟡</span>
                      <span className="font-medium text-sm">{item.product?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({item.quantity} {item.product?.unit})
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openRestockDialog(item)}
                      className="h-7 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Réappro.
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddDialog(true)}
            className="flex-1 bg-secondary hover:bg-secondary/90"
            disabled={availableProducts.length === 0}
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un produit
          </Button>
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

        {/* Stock List */}
        {filteredStocks.length === 0 ? (
          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "Aucun produit trouvé" : "Aucun produit en stock"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez des produits pour commencer
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredStocks.map(stock => {
              const status = getStockStatus(Number(stock.quantity), Number(stock.min_threshold));
              return (
                <Card key={stock.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          status === "out" ? "bg-destructive/10" : 
                          status === "low" ? "bg-amber-500/10" : "bg-green-500/10"
                        }`}>
                          <span className="text-2xl">
                            {status === "out" ? "📦" : status === "low" ? "📦" : "📦"}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{stock.product?.name}</h4>
                            {stock.product?.is_ifn && (
                              <Badge variant="outline" className="text-xs">IFN</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-bold text-foreground">
                              {stock.quantity} {stock.product?.unit}
                            </span>
                            {getStatusBadge(status)}
                          </div>
                          {stock.unit_price && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Prix: {Number(stock.unit_price).toLocaleString()} FCFA/{stock.product?.unit}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openRestockDialog(stock)}
                          className="h-8 w-8"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(stock)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStock(stock.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un produit au stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Produit</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantité initiale</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Seuil d'alerte</Label>
                <Input
                  type="number"
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>
            <div>
              <Label>Prix unitaire (FCFA)</Label>
              <Input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="Optionnel"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
              Annuler
            </Button>
            <Button 
              onClick={handleAddProduct} 
              disabled={!selectedProductId || isSaving}
              className="bg-secondary hover:bg-secondary/90"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={showRestockDialog} onOpenChange={setShowRestockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réapprovisionner {selectedStock?.product?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Stock actuel: {selectedStock?.quantity} {selectedStock?.product?.unit}
            </p>
            <div>
              <Label>Quantité à ajouter</Label>
              <Input
                type="number"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
            {restockQuantity && (
              <p className="text-sm text-muted-foreground">
                Nouveau stock: {Number(selectedStock?.quantity || 0) + parseFloat(restockQuantity || "0")} {selectedStock?.product?.unit}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRestockDialog(false); resetForm(); }}>
              Annuler
            </Button>
            <Button 
              onClick={handleRestock} 
              disabled={!restockQuantity || isSaving}
              className="bg-secondary hover:bg-secondary/90"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Valider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier {selectedStock?.product?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantité</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Seuil d'alerte</Label>
                <Input
                  type="number"
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>
            <div>
              <Label>Prix unitaire (FCFA)</Label>
              <Input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="Optionnel"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
              Annuler
            </Button>
            <Button 
              onClick={handleUpdateStock} 
              disabled={isSaving}
              className="bg-secondary hover:bg-secondary/90"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav items={navItems} />
    </div>
  );
}
