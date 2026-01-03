import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WalletBalanceProps {
  balance: number;
  currency?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function WalletBalance({ 
  balance, 
  currency = "FCFA", 
  isLoading = false,
  onRefresh 
}: WalletBalanceProps) {
  const [isVisible, setIsVisible] = useState(true);

  const formattedBalance = new Intl.NumberFormat("fr-FR").format(balance);

  return (
    <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-full">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium opacity-90">Mon Portefeuille</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-white/20"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isVisible ? "visible" : "hidden"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs opacity-70 mb-1">Solde disponible</p>
            <p className="text-3xl font-bold tracking-tight">
              {isVisible ? formattedBalance : "••••••"}{" "}
              <span className="text-lg font-normal">{currency}</span>
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </CardContent>
    </Card>
  );
}
