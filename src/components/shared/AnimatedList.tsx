import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const reducedMotionVariants = {
  hidden: {},
  visible: {},
};

export const AnimatedList = ({ 
  children, 
  className = '',
  staggerDelay = 0.05 
}: AnimatedListProps) => {
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion 
    ? reducedMotionVariants 
    : {
        ...containerVariants,
        visible: {
          ...containerVariants.visible,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedList;
