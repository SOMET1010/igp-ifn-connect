/**
 * Module Producteur - PNAVIM
 * Export centralisé
 */

// === PAGES (Architecture Vertical Slices) ===
export { default as ProducerDashboard } from './pages/ProducerDashboard';
export { default as ProducerHarvests } from './pages/ProducerHarvests';
export { default as ProducerOrders } from './pages/ProducerOrders';
export { default as ProducerProfilePage } from './pages/ProducerProfile';

// Hooks
export { useProducerData } from './hooks/useProducerData';
export { useProducerHarvests } from './hooks/useProducerHarvests';
export { useProducerOrders } from './hooks/useProducerOrders';

// Services
export { producerService } from './services/producerService';

// Components
export { ProducerStats } from './components/ProducerStats';
export { HarvestCard } from './components/HarvestCard';
export { AddHarvestDialog } from './components/AddHarvestDialog';
export { OrderCard } from './components/OrderCard';

// Types
export type {
  Producer,
  ProducerHarvest,
  CooperativeProducerOrder,
  ProducerStats as ProducerStatsType,
  HarvestFormData,
  HarvestStatus,
  QualityGrade,
  CooperativeOrderStatus,
} from './types/producer.types';
