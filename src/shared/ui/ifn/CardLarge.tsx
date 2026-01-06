import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";

interface CardLargeProps extends HTMLAttributes<HTMLDivElement> {
  onClick?: () => void;
}

const CardLarge = forwardRef<HTMLDivElement, CardLargeProps>(
  ({ className, children, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "p-6 rounded-2xl bg-card shadow-lg",
          "border-2 border-border/50",
          onClick && "cursor-pointer hover:shadow-xl active:scale-[0.99] transition-all",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardLarge.displayName = "CardLarge";

export { CardLarge };
