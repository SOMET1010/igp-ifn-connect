import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HeroMerchantCard } from '@/components/home/HeroMerchantCard';
import { RoleCardSmall } from '@/components/home/RoleCardSmall';
import { WaxPattern } from '@/components/shared/WaxPattern';
import { FloatingAccessibilityButton } from '@/components/shared/FloatingAccessibilityButton';
import { OnboardingTutorial } from '@/components/shared/OnboardingTutorial';

const Home: React.FC = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  // Show tutorial on first visit
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('pnavim-tutorial-seen');
    if (!hasSeenTutorial) {
      // Delay to let page load
      const timer = setTimeout(() => setShowTutorial(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem('pnavim-tutorial-seen', 'true');
    setShowTutorial(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with market image and overlay */}
      <div className="absolute inset-0">
        {/* Placeholder gradient background simulating blurred market */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-sable via-orange-sanguine/20 to-terre-battue/30"
        />
        
        {/* Warm orange overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(230, 126, 34, 0.15) 0%, rgba(194, 94, 0, 0.1) 50%, rgba(255, 245, 230, 0.9) 100%)',
          }}
        />
      </div>

      {/* Wax Pattern overlay */}
      <WaxPattern 
        variant="geometric" 
        opacity={0.06} 
        className="absolute inset-0 z-0" 
      />

      {/* Header */}
      <HomeHeader />

      {/* Main Content */}
      <main className="relative z-10 container max-w-lg mx-auto px-4 pt-24 pb-12">
        {/* Hero Merchant Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <HeroMerchantCard />
        </motion.div>

        {/* Secondary Role Cards */}
        <div className="mt-8 space-y-4">
          <RoleCardSmall role="agent" />
          <RoleCardSmall role="cooperative" />
        </div>

        {/* Footer logos */}
        <motion.footer
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-xs text-charbon/50 font-medium mb-3">
            Une initiative de
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <span className="text-xs font-semibold text-charbon/60 bg-white/60 px-3 py-1.5 rounded-lg">
              DGE
            </span>
            <span className="text-xs font-semibold text-charbon/60 bg-white/60 px-3 py-1.5 rounded-lg">
              ANSUT
            </span>
            <span className="text-xs font-semibold text-charbon/60 bg-white/60 px-3 py-1.5 rounded-lg">
              DGI
            </span>
          </div>
          <p className="mt-4 text-xs text-charbon/40">
            République de Côte d'Ivoire
          </p>
        </motion.footer>
      </main>

      {/* Decorative blobs */}
      <div className="absolute top-1/4 -right-20 w-64 h-64 bg-orange-sanguine/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-48 h-48 bg-vert-manioc/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Accessibility Button */}
      <FloatingAccessibilityButton />

      {/* Onboarding Tutorial */}
      <OnboardingTutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />
    </div>
  );
};

export default Home;
