import { Check } from "lucide-react";
import { cn } from "@/shared/lib";

interface StepProgressProps {
  steps: string[];
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                    isCompleted 
                      ? "bg-secondary text-secondary-foreground shadow-julaba-secondary" 
                      : isCurrent 
                        ? "bg-primary text-primary-foreground shadow-julaba-primary animate-pulse-ring"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-2 text-center max-w-16 leading-tight",
                  isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"
                )}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "flex-1 h-1 mx-2 rounded-full transition-all duration-500",
                    isCompleted ? "bg-secondary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
