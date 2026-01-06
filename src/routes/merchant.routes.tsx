/**
 * Routes Marchand - Architecture Vertical Slices (Phase 2)
 * 
 * 7 écrans principaux au lieu de 14
 * Pages importées depuis src/features/merchant/
 */

import { Route, Navigate } from 'react-router-dom';
import { RequireRole } from '@/app/guards';

// === IMPORT DEPUIS FEATURE MERCHANT ===
import {
  MerchantDashboard,
  MerchantSell,
  MerchantMoney,
  MerchantProfile,
  MerchantStock,
  MerchantCredits,
  MerchantClose,
  MerchantKyc,
  MerchantLogin,
  MerchantVoiceEntry,
  MerchantVoiceRegister,
  MerchantSecurityFallback,
} from '@/features/merchant';

// Module Voice Assistant
import { VoiceAssistant } from '@/features/voice-assistant';

/**
 * Routes publiques du marchand (connexion vocale uniquement)
 */
export const merchantPublicRoutes = (
  <>
    <Route path="/marchand/connexion" element={<MerchantVoiceEntry />} />
    <Route path="/marchand/login" element={<MerchantLogin />} />
    <Route path="/marchand/securite" element={<MerchantSecurityFallback />} />
    <Route path="/marchand/inscription-vocale" element={<MerchantVoiceRegister />} />
  </>
);

/**
 * Routes protégées du marchand - Architecture 7 écrans
 */
export const merchantProtectedRoutes = (
  <Route element={<RequireRole requiredRole="merchant" />}>
    {/* === ROUTES PRINCIPALES (7) === */}
    <Route path="/marchand" element={<MerchantDashboard />} />
    <Route path="/marchand/vendre" element={<MerchantSell />} />
    <Route path="/marchand/argent" element={<MerchantMoney />} />
    <Route path="/marchand/profil" element={<MerchantProfile />} />
    <Route path="/marchand/stock" element={<MerchantStock />} />
    <Route path="/marchand/credits" element={<MerchantCredits />} />
    <Route path="/marchand/cloture" element={<MerchantClose />} />
    
    {/* KYC standalone (wizard complet) */}
    <Route path="/marchand/kyc" element={<MerchantKyc />} />
    
    {/* Assistant vocal */}
    <Route path="/marchand/assistant-vocal" element={<VoiceAssistant />} />

    {/* === REDIRECTIONS LEGACY (compatibilité) === */}
    <Route path="/marchand/encaisser" element={<Navigate to="/marchand/vendre" replace />} />
    <Route path="/marchand/scanner" element={<Navigate to="/marchand/vendre?mode=scanner" replace />} />
    <Route path="/marchand/vente-rapide" element={<Navigate to="/marchand/vendre?mode=rapide" replace />} />
    <Route path="/marchand/historique" element={<Navigate to="/marchand/argent?tab=historique" replace />} />
    <Route path="/marchand/factures" element={<Navigate to="/marchand/argent?tab=factures" replace />} />
    <Route path="/marchand/aide" element={<Navigate to="/marchand/profil?section=aide" replace />} />
    <Route path="/marchand/cmu" element={<Navigate to="/marchand/profil?section=cmu" replace />} />
  </Route>
);

export default merchantProtectedRoutes;
