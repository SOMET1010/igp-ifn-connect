import { cn } from "@/lib/utils";
import { forwardRef, useState, MouseEvent } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { useReducedMotion, useButtonFeedback } from "@/shared/hooks";

interface RippleType {
  id: number;
  x: number;
  y: number;
}

interface ButtonPrimaryProps extends Omit<HTMLMotionProps<"button">, 'ref' | 'children'> {
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const ButtonPrimary = forwardRef<HTMLButtonElement, ButtonPrimaryProps>(
  ({ className, fullWidth = true, children, onClick, disabled, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const { triggerHaptic } = useButtonFeedback();
    const [ripples, setRipples] = useState<RippleType[]>([]);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      
      // Create ripple effect
      if (!prefersReducedMotion) {
        const rect = e.currentTarget.getBoundingClientRect();
        const newRipple: RippleType = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          id: Date.now()
        };
        setRipples(prev => [...prev, newRipple]);
      }
      
      // Haptic feedback
      triggerHaptic('tap');
      
      onClick?.(e);
    };

    const removeRipple = (id: number) => {
      setRipples(prev => prev.filter(r => r.id !== id));
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative h-16 sm:h-20 rounded-2xl text-xl font-black overflow-hidden",
          "bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)]",
          "text-white shadow-lg",
          "transition-colors duration-150",
          "touch-manipulation",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          fullWidth && "w-full",
          className
        )}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
        whileHover={prefersReducedMotion ? undefined : { 
          boxShadow: "0 0 20px hsla(142, 76%, 36%, 0.4)" 
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {/* Ripple container */}
        <span className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {ripples.map(ripple => (
            <motion.span
              key={ripple.id}
              className="absolute bg-white/30 rounded-full pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                translateX: '-50%',
                translateY: '-50%'
              }}
              initial={{ width: 0, height: 0, opacity: 0.5 }}
              animate={{ 
                width: 400, 
                height: 400, 
                opacity: 0
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              onAnimationComplete={() => removeRipple(ripple.id)}
            />
          ))}
        </span>
        
        {/* Button content */}
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }
);

ButtonPrimary.displayName = "ButtonPrimary";

export { ButtonPrimary };
