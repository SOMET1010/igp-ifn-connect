import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  sticky?: boolean;
  debounceMs?: number;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Rechercher...',
  className,
  sticky = false,
  debounceMs,
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Sync internal value with external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Handle debounced onChange
  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    
    if (debounceMs && debounceMs > 0) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    } else {
      onChange(newValue);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  // Animation variants
  const containerVariants = prefersReducedMotion
    ? {}
    : {
        blur: { 
          scale: 1,
        },
        focus: { 
          scale: 1.01,
        },
      };

  const iconVariants = prefersReducedMotion
    ? {}
    : {
        blur: { 
          x: 0, 
          scale: 1,
        },
        focus: { 
          x: -2, 
          scale: 1.1,
        },
      };

  const clearButtonVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { 
          opacity: 0, 
          scale: 0.8, 
          x: 5 
        },
        visible: { 
          opacity: 1, 
          scale: 1, 
          x: 0,
        },
      };

  return (
    <div
      className={cn(
        sticky && 'p-4 sticky top-[73px] bg-background z-10 border-b border-border',
        className
      )}
    >
      <motion.div
        className={cn(
          'relative max-w-lg mx-auto rounded-md transition-shadow duration-200',
          isFocused && 'shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]'
        )}
        variants={containerVariants}
        animate={isFocused ? 'focus' : 'blur'}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {/* Animated search icon */}
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
          variants={iconVariants}
          animate={isFocused ? 'focus' : 'blur'}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <Search 
            className={cn(
              'h-5 w-5 transition-colors duration-200',
              isFocused ? 'text-primary' : 'text-muted-foreground'
            )} 
          />
        </motion.div>

        {/* Input field */}
        <Input
          ref={inputRef}
          type="search"
          value={internalValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label={placeholder}
          className={cn(
            'pl-12 pr-10 transition-all duration-200',
            isFocused && 'border-primary/50'
          )}
        />

        {/* Animated clear button */}
        <AnimatePresence>
          {internalValue && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
              variants={clearButtonVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
