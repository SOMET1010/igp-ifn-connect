/**
 * Composant de guide rapide coopérative
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/shared/contexts';

export const QuickGuide: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Card className="card-institutional">
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-3">
          {t("quick_guide")}
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">1.</span>
            <span>{t("guide_coop_1")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">2.</span>
            <span>{t("guide_coop_2")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">3.</span>
            <span>{t("guide_coop_3")}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
