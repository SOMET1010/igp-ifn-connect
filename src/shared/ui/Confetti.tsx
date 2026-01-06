import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/shared/hooks";

interface ConfettiProps {
  duration?: number;
  particleCount?: number;
  className?: string;
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  color: string;
  size: number;
  isRectangle: boolean;
}

const AFRICAN_COLORS = [
  "hsl(33, 100%, 50%)",   // Orange vif
  "hsl(45, 100%, 50%)",   // Or / Gold
  "hsl(0, 0%, 100%)",     // Blanc
  "hsl(120, 73%, 75%)",   // Vert pâle
  "hsl(17, 100%, 74%)",   // Saumon léger
];

const Confetti = ({
  duration = 3000,
  particleCount = 50,
  className,
}: ConfettiProps) => {
  const [visible, setVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Cleanup after animation
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  // Generate particles with memoization
  const particles: Particle[] = useMemo(() => {
    // Reduce count on mobile
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const count = isMobile ? Math.floor(particleCount * 0.6) : particleCount;

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      color: AFRICAN_COLORS[Math.floor(Math.random() * AFRICAN_COLORS.length)],
      size: 6 + Math.random() * 6,
      isRectangle: Math.random() > 0.5,
    }));
  }, [particleCount]);

  if (!visible || prefersReducedMotion) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none z-10",
        className
      )}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.left}%`,
            top: "-20px",
            width: particle.isRectangle ? particle.size * 0.5 : particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${2 + Math.random()}s`,
            willChange: "transform",
            borderRadius: particle.isRectangle ? "1px" : "2px",
          }}
        />
      ))}
    </div>
  );
};

export { Confetti };
