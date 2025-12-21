import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonSecondaryProps extends Omit<ButtonProps, 'variant'> {
  fullWidth?: boolean;
}

const ButtonSecondary = forwardRef<HTMLButtonElement, ButtonSecondaryProps>(
  ({ className, fullWidth = true, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "h-14 sm:h-16 rounded-2xl text-lg font-bold",
          "bg-[hsl(24,95%,53%)] hover:bg-[hsl(24,95%,45%)]",
          "text-white shadow-md",
          "active:scale-[0.98] transition-all duration-150",
          "touch-manipulation",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

ButtonSecondary.displayName = "ButtonSecondary";

export { ButtonSecondary };
