/**
 * Composant Scanner intégré pour MerchantSell
 * Extrait de MerchantScanner.tsx
 */

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  QrCode,
  Search,
  Loader2,
  X,
  Plus,
  Minus,
  Wallet
} from "lucide-react";
import type { SelectedProduct } from "@/features/merchant";

interface ScannedProduct {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  stock_quantity: number;
}

interface ScannerTabProps {
  onCheckout: (products: SelectedProduct[]) => void;
}

export function ScannerTab({ onCheckout }: ScannerTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
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
    } catch {
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
              // Normal pendant le scan
            }
            requestAnimationFrame(detect);
          }
        };
        detect();
      } catch {
        toast({
          title: "Info",
          description: "Utilisez la saisie manuelle du code"
        });
      }
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
        title: "Produit ajouté",
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
        description: "Scannez des produits d'abord",
        variant: "destructive"
      });
      return;
    }
    
    // Convertir vers SelectedProduct et passer au checkout
    const convertedProducts: SelectedProduct[] = scannedProducts.map(p => ({
      product_id: p.id,
      product_name: p.name,
      quantity: p.quantity,
      unit_price: p.unit_price,
    }));
    
    onCheckout(convertedProducts);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Scanner Area */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isScanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover bg-muted"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-primary rounded-lg animate-pulse" />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={stopCamera}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <QrCode className="w-10 h-10 text-primary" />
              </div>
              {hasCamera ? (
                <Button onClick={startCamera} className="w-full h-14 text-lg rounded-xl">
                  <Camera className="w-5 h-5 mr-2" /> Activer le scanner
                </Button>
              ) : (
                <p className="text-muted-foreground">Caméra non disponible</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Code Input */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-foreground mb-2">Ou saisir manuellement :</p>
          <div className="flex gap-2">
            <Input
              placeholder="Nom du produit..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="h-12"
            />
            <Button 
              className="h-12 px-6" 
              onClick={() => manualCode && searchProduct(manualCode)}
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scanned Products */}
      {scannedProducts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-foreground mb-3">
              Produits ({scannedProducts.length})
            </h3>
            <div className="space-y-3">
              {scannedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.unit_price.toLocaleString()} FCFA × {product.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(product.id, -1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-bold">{product.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(product.id, 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeProduct(product.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total & Checkout */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-bold text-primary">{total.toLocaleString()} FCFA</span>
              </div>
              <Button 
                className="w-full h-14 text-lg font-bold rounded-xl"
                onClick={handleCheckout}
              >
                <Wallet className="w-5 h-5 mr-2" /> Encaisser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
