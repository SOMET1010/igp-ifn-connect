import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Percent, Tag, Calendar, TrendingUp, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import type { Promotion } from "../../types/promotions.types";
import { getPromotionStatus, isPromotionExpired } from "../../types/promotions.types";

interface PromotionCardProps {
  promotion: Promotion;
  onToggle: (id: string, currentState: boolean) => void;
  onDelete: (promotion: Promotion) => void;
}

export function PromotionCard({ promotion, onToggle, onDelete }: PromotionCardProps) {
  const status = getPromotionStatus(promotion);
  const isExpired = status === "expired";

  const statusBadge = {
    expired: <Badge variant="destructive">Expirée</Badge>,
    upcoming: <Badge variant="outline">À venir</Badge>,
    active: <Badge className="bg-secondary text-secondary-foreground">Active</Badge>,
    inactive: <Badge variant="outline">Désactivée</Badge>,
  };

  return (
    <Card className={`hover:shadow-lg transition-all ${isExpired || !promotion.is_active ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                promotion.discount_type === "percentage" ? "bg-accent/20" : "bg-primary/20"
              }`}
            >
              {promotion.discount_type === "percentage" ? (
                <Percent className="w-6 h-6 text-accent-foreground" />
              ) : (
                <Tag className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground">{promotion.name}</h3>
              <p className="text-lg font-bold text-primary">
                {promotion.discount_type === "percentage"
                  ? `-${promotion.discount_value}%`
                  : `-${promotion.discount_value.toLocaleString()} FCFA`}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">{statusBadge[status]}</div>
        </div>

        {promotion.description && (
          <p className="text-sm text-muted-foreground mb-3">{promotion.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(promotion.start_date).toLocaleDateString("fr-FR")} -{" "}
            {new Date(promotion.end_date).toLocaleDateString("fr-FR")}
          </span>
          {promotion.min_purchase && <span>Min: {promotion.min_purchase.toLocaleString()} FCFA</span>}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            {promotion.usage_count} utilisation{promotion.usage_count !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            {!isExpired && (
              <Button variant="ghost" size="sm" onClick={() => onToggle(promotion.id, promotion.is_active)}>
                {promotion.is_active ? (
                  <ToggleRight className="w-5 h-5 text-secondary" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(promotion)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
