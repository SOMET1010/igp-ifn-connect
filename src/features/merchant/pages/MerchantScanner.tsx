/**
 * Page Scanner - /marchand/scanner
 * Refactorisée avec Design System Jùlaba
 */

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaButton,
  JulabaInput,
  JulabaBottomNav,
  JulabaTabBar,
} from "@/shared/ui/julaba";
import { MERCHANT_NAV_ITEMS } from "@/config/navigation-julaba";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/shared/hooks";
import { X, Plus, Minus, Loader2 } from "lucide-react";
import { merchantLogger } from "@/infra/logger";

interface ScannedProduct {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  stock_quantity: number;
}

// Tabs Jùlaba
const SCANNER_TABS = [
  { id: "sale", label: "Vente", emoji: "🛒" },
  { id: "stock", label: "Stock", emoji: "📦" },
];

export default function MerchantScanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [mode, setMode] = useState<string>("sale");
  const [isLoading, setIsLoading] = useState(true);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    checkCameraAndFetchMerchant();
    return () => {
      stopCamera();
    };
  }, [user]);

  const checkCameraAndFetchMerchant = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput');
      setHasCamera(cameras.length > 0);
    } catch {
      setHasCamera(false);
    }

    if (user) {
      const { data: merchant } = await supabase
        .from("merchants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (merchant) {
        setMerchantId(merchant.id);
      }
    }
    setIsLoading(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        startBarcodeDetection();
      }
    } catch (error) {
      toast({
        title: "Erreur caméra",
        description: "Impossible d'accéder à la caméra",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const startBarcodeDetection = async () => {
    if ('BarcodeDetector' in window) {
      try {
        // @ts-ignore
        const barcodeDetector = new window.BarcodeDetector({
          formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39']
        });

        const detect = async () => {
          if (videoRef.current && isScanning) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                handleBarcodeScan(barcodes[0].rawValue);
              }
            } catch {
              console.debug('Barcode detection frame skipped');
            }
            requestAnimationFrame(detect);
          }
        };
        detect();
      } catch (initError) {
        merchantLogger.warn('BarcodeDetector initialization failed', { error: initError });
        toast({
          title: "Info",
          description: "Utilisez la saisie manuelle du code"
        });
      }
    } else {
      toast({
        title: "Info",
        description: "Scanner non supporté. Utilisez la saisie manuelle."
      });
    }
  };

  const handleBarcodeScan = async (code: string) => {
    stopCamera();
    await searchProduct(code);
  };

  const searchProduct = async (code: string) => {
    if (!merchantId) return;

    const { data: stockData } = await supabase
      .from("merchant_stocks")
      .select("id, quantity, unit_price, product_id")
      .eq("merchant_id", merchantId)
      .limit(10);

    if (!stockData || stockData.length === 0) {
      toast({
        title: "Produit non trouvé",
        description: `Code: ${code}`,
        variant: "destructive"
      });
      setManualCode("");
      return;
    }

    const productIds = stockData.map(s => s.product_id);
    const { data: products } = await supabase
      .from("products")
      .select("id, name")
      .in("id", productIds);

    const foundStock = stockData.find(s => {
      const product = products?.find(p => p.id === s.product_id);
      return product?.name?.toLowerCase().includes(code.toLowerCase()) || s.product_id.includes(code);
    });

    if (foundStock) {
      const product = products?.find(p => p.id === foundStock.product_id);
      const productName = product?.name || "Produit";
      
      const existingIndex = scannedProducts.findIndex(p => p.id === foundStock.product_id);
      
      if (existingIndex >= 0) {
        const updated = [...scannedProducts];
        updated[existingIndex].quantity += 1;
        setScannedProducts(updated);
      } else {
        setScannedProducts([...scannedProducts, {
          id: foundStock.product_id,
          name: productName,
          quantity: 1,
          unit_price: Number(foundStock.unit_price) || 0,
          stock_quantity: Number(foundStock.quantity)
        }]);
      }
      
      toast({
        title: "✅ Produit ajouté",
        description: productName
      });
    } else {
      toast({
        title: "Produit non trouvé",
        description: `Code: ${code}`,
        variant: "destructive"
      });
    }
    setManualCode("");
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = scannedProducts.map(p => 
      p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
    );
    setScannedProducts(updated);
  };

  const removeProduct = (id: string) => {
    setScannedProducts(scannedProducts.filter(p => p.id !== id));
  };

  const total = scannedProducts.reduce((sum, p) => sum + p.quantity * p.unit_price, 0);

  const handleCheckout = () => {
    if (scannedProducts.length === 0) {
      toast({
        title: "Panier vide",
        description: "Scanne des produits d'abord",
        variant: "destructive"
      });
      return;
    }
    
    sessionStorage.setItem('scannedProducts', JSON.stringify(scannedProducts));
    navigate("/marchand/encaisser");
  };

  if (isLoading) {
    return (
      <JulabaPageLayout background="warm" className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="warm" className="pb-24">
      <JulabaHeader
        title="📷 Scanner"
        backPath="/marchand"
      />

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Mode Toggle */}
        <JulabaTabBar
          tabs={SCANNER_TABS}
          activeTab={mode}
          onTabChange={setMode}
        />

        {/* Scanner Area */}
        <JulabaCard padding="none" className="overflow-hidden">
          {isScanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover bg-muted"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-4 border-primary rounded-2xl animate-pulse" />
              </div>
              <JulabaButton
                variant="danger"
                size="md"
                emoji="✖️"
                className="absolute top-3 right-3"
                onClick={stopCamera}
              >
                Arrêter
              </JulabaButton>
            </div>
          ) : (
            <div className="p-8 text-center space-y-4">
              <div className="text-6xl mb-4">📷</div>
              {hasCamera ? (
                <JulabaButton 
                  variant="hero" 
                  emoji="📸"
                  onClick={startCamera} 
                  className="w-full"
                >
                  Activer le scanner
                </JulabaButton>
              ) : (
                <p className="text-muted-foreground">Caméra non disponible</p>
              )}
            </div>
          )}
        </JulabaCard>

        {/* Manual Code Input */}
        <JulabaCard>
          <p className="text-sm font-bold text-foreground mb-3">
            Ou chercher manuellement :
          </p>
          <div className="flex gap-2">
            <JulabaInput
              placeholder="Nom du produit ou code..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              emoji="🔍"
              size="lg"
              className="flex-1"
            />
            <JulabaButton 
              variant="primary"
              emoji="🔍"
              onClick={() => manualCode && searchProduct(manualCode)}
            />
          </div>
        </JulabaCard>

        {/* Scanned Products */}
        {scannedProducts.length > 0 && (
          <JulabaCard>
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="text-xl">🛒</span>
              Produits scannés ({scannedProducts.length})
            </h3>
            <div className="space-y-3">
              {scannedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                >
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.unit_price.toLocaleString()} F × {product.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                      onClick={() => updateQuantity(product.id, -1)}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-8 text-center font-bold text-lg">{product.quantity}</span>
                    <button
                      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                      onClick={() => updateQuantity(product.id, 1)}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive"
                      onClick={() => removeProduct(product.id)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total & Checkout */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Total</span>
                <span className="text-3xl font-black text-primary">{total.toLocaleString()} F</span>
              </div>
              <JulabaButton 
                variant="hero"
                emoji="💰"
                className="w-full"
                onClick={handleCheckout}
              >
                Encaisser
              </JulabaButton>
            </div>
          </JulabaCard>
        )}

        {/* Tips */}
        <JulabaCard accent="gold">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-bold text-foreground mb-1">Conseils</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Pointe la caméra vers le code-barres</li>
                <li>• Assure un bon éclairage</li>
                <li>• Tiens le téléphone stable</li>
              </ul>
            </div>
          </div>
        </JulabaCard>
      </main>

      <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />
    </JulabaPageLayout>
  );
}
