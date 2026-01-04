/**
 * Page /marchand/vente-rapide - Vente Rapide Vocale
 * P.NA.VIM - Mode 5 secondes
 */

import { useNavigate } from 'react-router-dom';
import { QuickSaleScreen } from '@/features/sales';

export default function SalesQuick() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/marchand');
  };

  return <QuickSaleScreen onClose={handleClose} />;
}
