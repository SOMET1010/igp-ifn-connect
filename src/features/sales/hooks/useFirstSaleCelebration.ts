import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const CONFETTI_KEY_PREFIX = 'ifn_first_sale_celebrated_';

const hasAlreadyCelebratedToday = (): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return localStorage.getItem(`${CONFETTI_KEY_PREFIX}${today}`) === 'true';
};

const markAsCelebratedToday = () => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(`${CONFETTI_KEY_PREFIX}${today}`, 'true');
  // Cleanup yesterday's entry
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  localStorage.removeItem(`${CONFETTI_KEY_PREFIX}${yesterday}`);
};

export function useFirstSaleCelebration(todayTotal: number) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (todayTotal > 0 && !hasAlreadyCelebratedToday()) {
      setShowConfetti(true);
      markAsCelebratedToday();
      toast({
        title: `🎉 ${t("congratulations")}`,
        description: `${t("first_sale_today")}: ${todayTotal.toLocaleString()} FCFA`,
        duration: 5000,
      });
      setTimeout(() => setShowConfetti(false), 3500);
    }
  }, [todayTotal, t, toast]);

  return { showConfetti };
}
