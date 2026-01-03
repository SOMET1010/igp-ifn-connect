import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Trash2, Users, Phone } from "lucide-react";
import type { Beneficiary } from "../types/wallet.types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface BeneficiaryListProps {
  beneficiaries: Beneficiary[];
  onSelect: (beneficiary: Beneficiary) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onRemove?: (id: string) => void;
  isLoading?: boolean;
}

export function BeneficiaryList({ 
  beneficiaries, 
  onSelect,
  onToggleFavorite,
  onRemove,
  isLoading 
}: BeneficiaryListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contacts fréquents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex flex-col items-center gap-2 p-3 w-20">
                <div className="w-12 h-12 rounded-full bg-muted" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (beneficiaries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contacts fréquents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Vos contacts apparaîtront ici après votre premier transfert</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-4 w-4" />
          Contacts fréquents
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 p-4">
            {beneficiaries.map((beneficiary) => (
              <div
                key={beneficiary.id}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer min-w-[100px] group relative"
                onClick={() => onSelect(beneficiary)}
              >
                {/* Favorite star */}
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(beneficiary.id, !beneficiary.is_favorite);
                    }}
                  >
                    <Star 
                      className={`h-3 w-3 ${beneficiary.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} 
                    />
                  </Button>
                )}

                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(beneficiary.merchant_name || beneficiary.nickname)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <p className="text-sm font-medium truncate max-w-[90px]">
                    {beneficiary.nickname || beneficiary.merchant_name || "Contact"}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{beneficiary.phone?.slice(-4)}</span>
                  </div>
                </div>

                {/* Remove button */}
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(beneficiary.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
