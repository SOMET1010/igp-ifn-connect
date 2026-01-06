import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { ButtonSecondary } from "./ButtonSecondary";
import { Confetti } from "@/shared/ui";

interface SuccessScreenProps {
  title?: string;
  amount?: number;
  subtitle?: string;
  onComplete?: () => void;
  onNewAction?: () => void;
  newActionLabel?: string;
  onViewReceipt?: () => void;
  viewReceiptLabel?: string;
  autoReturnSeconds?: number;
  className?: string;
}

const SuccessScreen = ({
  title = "C'est fait !",
  amount,
  subtitle,
  onComplete,
  onNewAction,
  newActionLabel = "Nouvelle vente",
  onViewReceipt,
  viewReceiptLabel = "Voir le reçu",
  autoReturnSeconds = 3,
  className
}: SuccessScreenProps) => {
  const [countdown, setCountdown] = useState(autoReturnSeconds);
  const [countdownStopped, setCountdownStopped] = useState(false);

  useEffect(() => {
    if (countdownStopped) return;
    
    if (countdown <= 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onComplete, countdownStopped]);

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col items-center justify-center",
      "bg-[hsl(142,76%,36%)] text-white p-6",
      className
    )}>
      {/* Confetti animation */}
      <Confetti duration={3000} particleCount={50} />

      {/* Animated checkmark */}
      <div className="animate-bounce mb-6">
        <CheckCircle2 className="w-24 h-24 sm:w-32 sm:h-32" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-black mb-4 text-center">
        {title}
      </h1>

      {/* Amount */}
      {amount !== undefined && (
        <div className="text-5xl sm:text-6xl font-black mb-2 animate-pulse">
          {amount.toLocaleString("fr-FR")}
          <span className="text-2xl sm:text-3xl ml-2">FCFA</span>
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p className="text-lg sm:text-xl opacity-90 mt-4 text-center">
          {subtitle}
        </p>
      )}

      {/* Countdown */}
      <p className="mt-8 text-sm opacity-70">
        Retour dans {countdown}s...
      </p>

      {/* Action buttons */}
      <div className="mt-6 space-y-3 w-full max-w-xs">
        {onNewAction && (
          <ButtonSecondary
            onClick={onNewAction}
            className="w-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/30"
          >
            {newActionLabel}
          </ButtonSecondary>
        )}
        
        {onViewReceipt && (
          <ButtonSecondary
            onClick={() => {
              setCountdownStopped(true);
              onViewReceipt();
            }}
            className="w-full bg-white/10 hover:bg-white/20 text-white border-2 border-white/20"
          >
            📄 {viewReceiptLabel}
          </ButtonSecondary>
        )}
      </div>
    </div>
  );
};

export { SuccessScreen };
