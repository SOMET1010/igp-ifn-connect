/**
 * Routes Marchand
 * 
 * Routes protégées pour les marchands
 */

import { Route } from 'react-router-dom';
import { RequireRole } from '@/app/guards';

// Pages publiques (login, inscription)
import MerchantLogin from '@/pages/merchant/MerchantLogin';
import MerchantVoiceEntry from '@/pages/merchant/MerchantVoiceEntry';
import MerchantSecurityFallback from '@/pages/merchant/MerchantSecurityFallback';
import MerchantVoiceRegister from '@/pages/merchant/MerchantVoiceRegister';

// Pages protégées
import MerchantDashboard from '@/pages/merchant/MerchantDashboard';
import MerchantCashier from '@/pages/merchant/MerchantCashier';
import MerchantCMU from '@/pages/merchant/MerchantCMU';
import MerchantProfile from '@/pages/merchant/MerchantProfile';
import MerchantTransactions from '@/pages/merchant/MerchantTransactions';
import MerchantStock from '@/pages/merchant/MerchantStock';
import MerchantCredits from '@/pages/merchant/MerchantCredits';
import MerchantScanner from '@/pages/merchant/MerchantScanner';
import MerchantPromotions from '@/pages/merchant/MerchantPromotions';
import MerchantSuppliers from '@/pages/merchant/MerchantSuppliers';
import MerchantMoney from '@/pages/merchant/MerchantMoney';
import MerchantHelp from '@/pages/merchant/MerchantHelp';
import MerchantUnderstand from '@/pages/merchant/MerchantUnderstand';
import MerchantInvoices from '@/pages/merchant/MerchantInvoices';
import MerchantWallet from '@/pages/merchant/MerchantWallet';
import MerchantKyc from '@/pages/merchant/MerchantKyc';

/**
 * Routes publiques du marchand (login, inscription)
 */
export const merchantPublicRoutes = (
  <>
    <Route path="/marchand/login" element={<MerchantLogin />} />
    <Route path="/marchand/connexion" element={<MerchantVoiceEntry />} />
    <Route path="/marchand/securite" element={<MerchantSecurityFallback />} />
    <Route path="/marchand/inscription-vocale" element={<MerchantVoiceRegister />} />
  </>
);

/**
 * Routes protégées du marchand
 */
export const merchantProtectedRoutes = (
  <Route element={<RequireRole requiredRole="merchant" />}>
    <Route path="/marchand" element={<MerchantDashboard />} />
    <Route path="/marchand/encaisser" element={<MerchantCashier />} />
    <Route path="/marchand/historique" element={<MerchantTransactions />} />
    <Route path="/marchand/argent" element={<MerchantMoney />} />
    <Route path="/marchand/aide" element={<MerchantHelp />} />
    <Route path="/marchand/profil" element={<MerchantProfile />} />
    <Route path="/marchand/stock" element={<MerchantStock />} />
    <Route path="/marchand/cmu" element={<MerchantCMU />} />
    <Route path="/marchand/credits" element={<MerchantCredits />} />
    <Route path="/marchand/scanner" element={<MerchantScanner />} />
    <Route path="/marchand/promotions" element={<MerchantPromotions />} />
    <Route path="/marchand/fournisseurs" element={<MerchantSuppliers />} />
    <Route path="/marchand/comprendre" element={<MerchantUnderstand />} />
    <Route path="/marchand/factures" element={<MerchantInvoices />} />
    <Route path="/marchand/wallet" element={<MerchantWallet />} />
    <Route path="/marchand/kyc" element={<MerchantKyc />} />
  </Route>
);

export default merchantProtectedRoutes;
