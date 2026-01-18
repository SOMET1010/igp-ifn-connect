/**
 * JulabaStepIndicator - Indicateur d'étapes inclusif
 * 
 * Design: Cercles avec emojis, ligne de connexion, étape active mise en avant
 */
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface JulabaStep {
  id: string;
  emoji: string;
  label: string;
}

export interface JulabaStepIndicatorProps {
  steps: JulabaStep[];
  currentStep: number;
  className?: string;
}

export function JulabaStepIndicator({
  steps,
  currentStep,
  className,
}: JulabaStepIndicatorProps) {
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    "transition-all duration-300",
                    "border-2",
                    isCompleted && "bg-[hsl(145_74%_42%)] border-[hsl(145_74%_42%)]",
                    isCurrent && [
                      "bg-gradient-to-br from-[hsl(30_100%_60%)] to-[hsl(27_100%_50%)]",
                      "border-[hsl(30_100%_60%)]",
                      "shadow-lg shadow-[hsl(30_100%_60%)/30]",
                      "scale-110"
                    ],
                    !isCompleted && !isCurrent && "bg-white border-[hsl(30_20%_85%)]"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  ) : (
                    <span className={cn(
                      "text-xl",
                      isCurrent ? "text-white" : "grayscale opacity-50"
                    )}>
                      {step.emoji}
                    </span>
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "mt-2 text-xs font-semibold text-center max-w-[60px] truncate",
                  isCurrent ? "text-[hsl(27_100%_45%)]" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              
              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 h-1 mx-2 mb-6">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isCompleted 
                        ? "bg-[hsl(145_74%_42%)]" 
                        : "bg-[hsl(30_20%_90%)]"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
