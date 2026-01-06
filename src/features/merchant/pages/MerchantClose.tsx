/**
 * Page de clôture de journée - /marchand/cloture
 * Rituel de fin de journée pour UX inclusive
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowLeft, Moon, Sun, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EnhancedHeader } from "@/components/shared/EnhancedHeader";
import { AudioButton } from "@/components/shared/AudioButton";
import { useDailySession } from "@/features/merchant/hooks/useDailySession";
import { useMerchantDashboardData } from "@/features/merchant/hooks/useMerchantDashboardData";
import { PnavimButton, PnavimCard, PnavimStat } from "@/components/pnavim";

type CloseStep = "summary" | "confirm" | "success";

export default function MerchantClose() {
  const navigate = useNavigate();
  const [step, setStep] = useState<CloseStep>("summary");
  const [closingCash, setClosingCash] = useState<number>(0);
  
  const { data } = useMerchantDashboardData();
  const {
    todaySession,
    sessionStatus,
    closeSession,
    isClosing,
    getSummary,
  } = useDailySession();

  const todayTotal = data?.todayTotal || 0;
  const todayTransactions = data?.todayTransactions || 0;
  
  // Résumé de la journée
  const summary = getSummary();
  
  const handleClose = () => {
    closeSession({
      closing_cash: closingCash,
      notes: "",
    });
    setStep("success");
  };

  // Page succès après clôture
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pnavim-bg to-white flex flex-col">
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="w-24 h-24 rounded-full bg-pnavim-secondary flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Moon className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bonne soirée ! 🌙
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Ta journée est terminée. Repose-toi bien !
          </p>

          {/* Résumé final */}
          <Card className="w-full max-w-sm mb-8">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-2">Tu as gagné aujourd'hui</p>
              <p className="text-4xl font-black text-pnavim-secondary">
                {todayTotal.toLocaleString()} <span className="text-lg">FCFA</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                en {todayTransactions} vente{todayTransactions > 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <PnavimButton
            size="xl"
            onClick={() => navigate("/marchand")}
            fullWidth
          >
            <Sun className="w-6 h-6 mr-2" />
            Retour à l'accueil
          </PnavimButton>
        </motion.div>
      </div>
    );
  }

  // Page de confirmation
  if (step === "confirm") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pnavim-bg to-white">
        <EnhancedHeader
          title="Clôturer"
          showBack
          backTo="/marchand"
          showNotifications={false}
        />
        
        <main className="p-4 space-y-6 max-w-lg mx-auto">
          <AudioButton 
            textToRead={`Tu veux fermer ta journée ? Tu as fait ${todayTransactions} ventes pour ${todayTotal} francs.`}
            className="fixed bottom-24 right-4 z-50"
            size="lg"
          />

          <PnavimCard variant="elevated" className="text-center py-8">
            <Moon className="w-16 h-16 text-pnavim-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Fermer la journée ?</h2>
            <p className="text-muted-foreground">
              Tu ne pourras plus vendre après ça
            </p>
          </PnavimCard>

          <div className="flex gap-4">
            <PnavimButton
              variant="outline"
              size="lg"
              onClick={() => setStep("summary")}
              fullWidth
            >
              Non, annuler
            </PnavimButton>
            <PnavimButton
              variant="primary"
              size="lg"
              onClick={handleClose}
              isLoading={isClosing}
              fullWidth
            >
              <Check className="w-5 h-5 mr-2" />
              Oui, fermer
            </PnavimButton>
          </div>
        </main>
      </div>
    );
  }

  // Page résumé (défaut)
  return (
    <div className="min-h-screen bg-gradient-to-b from-pnavim-bg to-white pb-24">
      <EnhancedHeader
        title="Fin de journée"
        subtitle="Résumé de tes ventes"
        showBack
        backTo="/marchand"
        showNotifications={false}
      />

      <main className="p-4 space-y-5 max-w-lg mx-auto">
        <AudioButton 
          textToRead={`Aujourd'hui tu as fait ${todayTransactions} ventes pour un total de ${todayTotal} francs CFA.`}
          className="fixed bottom-24 right-4 z-50"
          size="lg"
        />

        {/* Stats du jour */}
        <div className="grid grid-cols-2 gap-4">
          <PnavimStat
            icon={TrendingUp}
            value={todayTransactions}
            label="Ventes"
            variant="success"
          />
          <PnavimStat
            icon={TrendingUp}
            value={`${todayTotal.toLocaleString()}`}
            label="FCFA gagnés"
            variant="primary"
          />
        </div>

        {/* Détails session */}
        {todaySession && (
          <PnavimCard>
            <h3 className="font-bold mb-4">Détails de la journée</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ouverture</span>
                <span className="font-medium">
                  {new Date(todaySession.opened_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Caisse d'ouverture</span>
                <span className="font-medium">{todaySession.opening_cash?.toLocaleString() || 0} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ventes du jour</span>
                <span className="font-medium text-pnavim-secondary">+{todayTotal.toLocaleString()} FCFA</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold">Total attendu</span>
                <span className="font-bold text-lg">
                  {((todaySession.opening_cash || 0) + todayTotal).toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </PnavimCard>
        )}

        {/* Message encourageant */}
        <PnavimCard className="bg-pnavim-secondary/10 border-pnavim-secondary/30">
          <div className="flex items-center gap-4">
            <span className="text-4xl">💪</span>
            <div>
              <p className="font-bold text-foreground">
                {todayTransactions > 5 ? "Super journée !" : todayTransactions > 0 ? "Bon travail !" : "Demain sera meilleur !"}
              </p>
              <p className="text-sm text-muted-foreground">
                {todayTransactions > 5 
                  ? "Tu as bien travaillé aujourd'hui" 
                  : todayTransactions > 0 
                  ? "Chaque vente compte" 
                  : "Repose-toi bien ce soir"}
              </p>
            </div>
          </div>
        </PnavimCard>

        {/* Bouton clôturer */}
        {sessionStatus === "open" && (
          <PnavimButton
            variant="primary"
            size="xl"
            onClick={() => setStep("confirm")}
            fullWidth
            leftIcon={<Moon className="w-6 h-6" />}
          >
            Clôturer ma journée
          </PnavimButton>
        )}

        {sessionStatus !== "open" && (
          <PnavimCard className="text-center py-6">
            <p className="text-muted-foreground">
              {sessionStatus === "closed" ? "Journée déjà clôturée ✓" : "Ouvre ta journée d'abord"}
            </p>
            <PnavimButton
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/marchand")}
            >
              Retour à l'accueil
            </PnavimButton>
          </PnavimCard>
        )}
      </main>
    </div>
  );
}
