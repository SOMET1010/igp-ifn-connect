import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonPrimaryProps extends Omit<ButtonProps, 'variant'> {
  fullWidth?: boolean;
}

const ButtonPrimary = forwardRef<HTMLButtonElement, ButtonPrimaryProps>(
  ({ className, fullWidth = true, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "h-16 sm:h-20 rounded-2xl text-xl font-black",
          "bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)]",
          "text-white shadow-lg",
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

ButtonPrimary.displayName = "ButtonPrimary";

export { ButtonPrimary };
