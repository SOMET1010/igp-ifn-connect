import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { clientNavItems } from '@/config/clientNavigation';
import { 
  ServiceCard, 
  useFinancialServices, 
  useClientServices, 
  useClientData,
  useActivateService,
} from '@/features/client';
import type { ServiceType, KycLevel } from '@/features/client';

const SERVICE_TYPES: { value: string; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'savings', label: 'Épargne' },
  { value: 'credit', label: 'Crédit' },
  { value: 'insurance', label: 'Assurance' },
  { value: 'mobile_money', label: 'Mobile' },
  { value: 'transfer', label: 'Transfert' },
];

const ClientServices: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { client } = useClientData();
  const { data: allServices = [], isLoading } = useFinancialServices();
  const { data: clientServices = [] } = useClientServices(client?.id);
  const activateService = useActivateService(client?.id);

  const clientKycLevel = (client?.kyc_level || 'level_0') as KycLevel;
  const activatedServiceIds = new Set(clientServices.map(s => s.service_id));

  // Filter services
  const filteredServices = allServices.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.provider_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTab === 'all' || service.type === activeTab;
    return matchesSearch && matchesType;
  });

  const handleActivate = (serviceId: string) => {
    activateService.mutate({ serviceId, clientKycLevel });
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold flex-1">Services Financiers</h1>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            {SERVICE_TYPES.map((type) => (
              <Button
                key={type.value}
                variant={activeTab === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(type.value)}
                className="flex-shrink-0"
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucun service trouvé</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ServiceCard
                  service={service}
                  isActivated={activatedServiceIds.has(service.id)}
                  clientKycLevel={clientKycLevel}
                  onActivate={() => handleActivate(service.id)}
                  onView={() => navigate(`/client/services/${service.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <UnifiedBottomNav items={clientNavItems} />
    </div>
  );
};

export default ClientServices;
