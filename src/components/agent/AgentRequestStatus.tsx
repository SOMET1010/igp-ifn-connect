import React from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgentRequest } from '@/hooks/useAgentRequest';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AgentRequestStatusProps {
  request: AgentRequest;
  onCancel?: () => void;
  onRetry?: () => void;
  isLoading?: boolean;
}

export function AgentRequestStatus({ request, onCancel, onRetry, isLoading }: AgentRequestStatusProps) {
  const getStatusConfig = () => {
    switch (request.status) {
      case 'pending':
        return {
          icon: Clock,
          title: 'Demande en attente',
          description: 'Votre demande est en cours de traitement par un administrateur.',
          variant: 'secondary' as const,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
        };
      case 'approved':
        return {
          icon: CheckCircle,
          title: 'Demande approuvée',
          description: 'Félicitations ! Votre demande a été acceptée. Rechargez la page pour accéder au tableau de bord.',
          variant: 'default' as const,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'rejected':
        return {
          icon: XCircle,
          title: 'Demande refusée',
          description: request.rejection_reason || 'Votre demande n\'a pas été acceptée.',
          variant: 'destructive' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      default:
        return {
          icon: Clock,
          title: 'Statut inconnu',
          description: 'Veuillez contacter un administrateur.',
          variant: 'outline' as const,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className={`mx-auto w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
          <Icon className={`w-8 h-8 ${config.color}`} />
        </div>
        <CardTitle className="text-xl">{config.title}</CardTitle>
        <CardDescription className="text-base">
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nom</span>
            <span className="font-medium">{request.full_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Organisation</span>
            <span className="font-medium">{request.organization}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date de demande</span>
            <span className="font-medium">
              {format(new Date(request.created_at), 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">Statut</span>
            <Badge variant={config.variant}>
              {request.status === 'pending' && 'En attente'}
              {request.status === 'approved' && 'Approuvée'}
              {request.status === 'rejected' && 'Refusée'}
            </Badge>
          </div>
        </div>

        {request.status === 'pending' && onCancel && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler ma demande
          </Button>
        )}

        {request.status === 'rejected' && onRetry && (
          <Button
            className="w-full"
            onClick={onRetry}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Soumettre une nouvelle demande
          </Button>
        )}

        {request.status === 'approved' && (
          <Button
            className="w-full"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Rafraîchir la page
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
