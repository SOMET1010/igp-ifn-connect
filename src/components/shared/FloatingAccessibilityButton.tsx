import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Calculator, HelpCircle, Eye, GraduationCap } from 'lucide-react';
import { AccessibilityControls } from './AccessibilityControls';
import { CurrencyCalculator } from './CurrencyCalculator';
import { OnboardingTutorial } from './OnboardingTutorial';

interface FloatingAccessibilityButtonProps {
  showCalculator?: boolean;
  showTutorial?: boolean;
  helpPageKey?: string;
}

export const FloatingAccessibilityButton: React.FC<FloatingAccessibilityButtonProps> = ({
  showCalculator = true,
  showTutorial = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const actions = [
    ...(showTutorial ? [{
      icon: <GraduationCap className="w-5 h-5" />,
      label: 'Tutoriel',
      onClick: () => setShowOnboarding(true),
      color: 'bg-blue-500'
    }] : []),
    ...(showCalculator ? [{
      icon: <Calculator className="w-5 h-5" />,
      label: 'Calculateur',
      onClick: () => setShowCalc(true),
      color: 'bg-primary'
    }] : []),
    {
      icon: <Eye className="w-5 h-5" />,
      label: 'Accessibilité',
      onClick: () => setShowAccessibility(true),
      color: 'bg-secondary'
    }
  ];

  return (
    <>
      {/* FAB Container */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col-reverse items-end gap-3">
        {/* Expanded Actions */}
        {isExpanded && (
          <>
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.onClick();
                  setIsExpanded(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-full ${action.color} text-white shadow-lg`}
              >
                {action.icon}
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </>
        )}

        {/* Main FAB */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
            isExpanded ? 'bg-charbon text-white' : 'bg-accent text-accent-foreground'
          }`}
          animate={{ rotate: isExpanded ? 45 : 0 }}
        >
          <Settings className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Modals */}
      <AccessibilityControls 
        isOpen={showAccessibility} 
        onClose={() => setShowAccessibility(false)} 
      />
      
      <CurrencyCalculator 
        isOpen={showCalc} 
        onClose={() => setShowCalc(false)} 
      />
      
      <OnboardingTutorial 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </>
  );
};
