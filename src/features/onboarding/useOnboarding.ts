import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'pnavim_onboarding_complete';

export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isComplete = localStorage.getItem(ONBOARDING_KEY) === 'true';
    setNeedsOnboarding(!isComplete);
    setIsLoading(false);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setNeedsOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setNeedsOnboarding(true);
  };

  return {
    needsOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
}
