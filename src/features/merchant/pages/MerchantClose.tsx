/**
 * Page de clôture de journée - /marchand/cloture
 * Refactorisée avec Design System Jùlaba
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  JulabaPageLayout, 
  JulabaHeader, 
  JulabaButton, 
  JulabaCard, 
  JulabaStatCard,
  JulabaTantie,
} from "@/shared/ui/julaba";
import { AudioButton } from "@/shared/ui";
import { useDailySession } from "@/features/merchant/hooks/useDailySession";
import { useMerchantDashboardData } from "@/features/merchant/hooks/useMerchantDashboardData";

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
  } = useDailySession();

  const todayTotal = data?.todayTotal || 0;
  const todayTransactions = data?.todayTransactions || 0;
  
  const handleClose = () => {
    closeSession({
      closing_cash: closingCash,
      notes: "",
    });
    setStep("success");
  };

  // Message Tantie contextuel
  const getTantieMessage = () => {
    if (todayTransactions > 5) {
      return "Super journée aujourd'hui ! Tu as bien travaillé. Repose-toi bien ce soir.";
    }
    if (todayTransactions > 0) {
      return "Bon travail ! Chaque vente compte. Demain sera encore meilleur.";
    }
    return "Journée calme aujourd'hui. C'est pas grave, demain sera meilleur !";
  };

  // Page succès après clôture
  if (step === "success") {
    return (
      <JulabaPageLayout background="warm" className="flex flex-col">
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="text-8xl mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            🌙
          </motion.div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bonne soirée !
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Ta journée est terminée. Repose-toi bien !
          </p>

          {/* Résumé final */}
          <JulabaCard accent="green" className="w-full max-w-sm mb-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Tu as gagné aujourd'hui</p>
              <p className="text-4xl font-black text-secondary">
                {todayTotal.toLocaleString()} <span className="text-lg">FCFA</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                en {todayTransactions} vente{todayTransactions > 1 ? "s" : ""}
              </p>
            </div>
          </JulabaCard>

          <JulabaButton
            variant="hero"
            emoji="☀️"
            onClick={() => navigate("/marchand")}
            className="w-full max-w-sm"
          >
            Retour à l'accueil
          </JulabaButton>
        </motion.div>
      </JulabaPageLayout>
    );
  }

  // Page de confirmation
  if (step === "confirm") {
    return (
      <JulabaPageLayout background="warm">
        <JulabaHeader
          title="🌙 Clôturer"
          backPath="/marchand"
        />
        
        <main className="p-4 space-y-6 max-w-lg mx-auto">
          <AudioButton 
            textToRead={`Tu veux fermer ta journée ? Tu as fait ${todayTransactions} ventes pour ${todayTotal} francs.`}
            className="fixed bottom-24 right-4 z-50"
            size="lg"
          />

          <JulabaCard className="text-center py-8">
            <div className="text-6xl mb-4">🌙</div>
            <h2 className="text-2xl font-bold mb-2">Fermer la journée ?</h2>
            <p className="text-muted-foreground">
              Tu ne pourras plus vendre après ça
            </p>
          </JulabaCard>

          <div className="flex gap-4">
            <JulabaButton
              variant="secondary"
              onClick={() => setStep("summary")}
              className="flex-1"
            >
              Non, annuler
            </JulabaButton>
            <JulabaButton
              variant="primary"
              emoji="✅"
              onClick={handleClose}
              isLoading={isClosing}
              className="flex-1"
            >
              Oui, fermer
            </JulabaButton>
          </div>
        </main>
      </JulabaPageLayout>
    );
  }

  // Page résumé (défaut)
  return (
    <JulabaPageLayout background="warm" className="pb-24">
      <JulabaHeader
        title="🌙 Fermer ma journée"
        backPath="/marchand"
      />

      <main className="p-4 space-y-5 max-w-lg mx-auto">
        <AudioButton 
          textToRead={`Aujourd'hui tu as fait ${todayTransactions} ventes pour un total de ${todayTotal} francs CFA.`}
          className="fixed bottom-24 right-4 z-50"
          size="lg"
        />

        {/* Stats du jour */}
        <div className="grid grid-cols-2 gap-4">
          <JulabaStatCard
            emoji="📊"
            value={todayTransactions}
            label="Ventes"
            iconBg="blue"
          />
          <JulabaStatCard
            emoji="💰"
            value={`${todayTotal.toLocaleString()}`}
            suffix="F"
            label="Gagnés"
            iconBg="green"
          />
        </div>

        {/* Détails session */}
        {todaySession && (
          <JulabaCard>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="text-xl">📋</span>
              Détails de la journée
            </h3>
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
                <span className="font-medium text-secondary">+{todayTotal.toLocaleString()} FCFA</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold">Total attendu</span>
                <span className="font-bold text-lg">
                  {((todaySession.opening_cash || 0) + todayTotal).toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </JulabaCard>
        )}

        {/* Message encourageant avec Tantie */}
        <JulabaTantie
          message={getTantieMessage()}
          variant="small"
        />

        {/* Bouton clôturer */}
        {sessionStatus === "open" && (
          <JulabaButton
            variant="hero"
            emoji="🌙"
            onClick={() => setStep("confirm")}
            className="w-full mt-4"
          >
            Clôturer ma journée
          </JulabaButton>
        )}

        {sessionStatus !== "open" && (
          <JulabaCard className="text-center py-6">
            <p className="text-muted-foreground">
              {sessionStatus === "closed" ? "✅ Journée déjà clôturée" : "Ouvre ta journée d'abord"}
            </p>
            <JulabaButton
              variant="secondary"
              className="mt-4"
              onClick={() => navigate("/marchand")}
            >
              Retour à l'accueil
            </JulabaButton>
          </JulabaCard>
        )}
      </main>
    </JulabaPageLayout>
  );
}
