import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useReducedMotion } from '@/shared/hooks';

interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: 'easeOut' 
    }
  },
};

const reducedMotionVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

export const AnimatedListItem = ({ children, className = '' }: AnimatedListItemProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={prefersReducedMotion ? reducedMotionVariants : itemVariants}
    >
      {children}
    </motion.div>
  );
};
