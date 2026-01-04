import React, { useEffect, useState } from 'react';
import { Phone, Clock, CheckCircle, XCircle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAgentValidation, ValidationRequest } from '@/features/auth/hooks/useAgentValidation';
import { cn } from '@/lib/utils';

interface AgentValidationRequestProps {
  merchantId: string;
  merchantName?: string;
  phone: string;
  reason: string;
  onValidated: () => void;
  onRejected: () => void;
  onCancel: () => void;
  className?: string;
}

export function AgentValidationRequest({
  merchantId,
  merchantName,
  phone,
  reason,
  onValidated,
  onRejected,
  onCancel,
  className,
}: AgentValidationRequestProps) {
  const {
    currentRequest,
    isRequesting,
    requestValidation,
    subscribeToValidation,
  } = useAgentValidation();

  const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60);
  const [status, setStatus] = useState<ValidationRequest['result']>('pending');

  // Demander la validation au montage
  useEffect(() => {
    const initValidation = async () => {
      await requestValidation(merchantId, phone, reason, 'escalation');
    };
    initValidation();
  }, [merchantId, phone, reason, requestValidation]);

  // Écouter les changements de statut
  useEffect(() => {
    if (!currentRequest) return;

    const unsubscribe = subscribeToValidation(currentRequest.id, (newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'approved') {
        onValidated();
      } else if (newStatus === 'rejected' || newStatus === 'expired') {
        onRejected();
      }
    });

    return unsubscribe;
  }, [currentRequest, subscribeToValidation, onValidated, onRejected]);

  // Timer de compte à rebours
  useEffect(() => {
    if (!currentRequest) return;

    const expiresAt = new Date(currentRequest.expiresAt).getTime();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setStatus('expired');
        onRejected();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRequest, onRejected]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRequesting) {
    return (
      <Card className={cn('bg-muted/50', className)}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Envoi de la demande...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'approved') {
    return (
      <Card className={cn('bg-green-50 border-green-200', className)}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-green-800">Validé !</h3>
          <p className="text-green-600 mt-2">Un agent a approuvé votre connexion</p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'rejected') {
    return (
      <Card className={cn('bg-red-50 border-red-200', className)}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <XCircle className="h-12 w-12 text-red-600 mb-4" />
          <h3 className="text-lg font-semibold text-red-800">Refusé</h3>
          <p className="text-red-600 mt-2">La validation a été refusée</p>
          <Button variant="outline" className="mt-4" onClick={onCancel}>
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === 'expired') {
    return (
      <Card className={cn('bg-orange-50 border-orange-200', className)}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Clock className="h-12 w-12 text-orange-600 mb-4" />
          <h3 className="text-lg font-semibold text-orange-800">Expiré</h3>
          <p className="text-orange-600 mt-2">Le délai de validation est dépassé</p>
          <Button variant="outline" className="mt-4" onClick={onCancel}>
            Nouvelle demande
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-background', className)}>
      <CardContent className="py-6">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-center mb-2">
          Validation en cours
        </h3>
        
        <p className="text-muted-foreground text-center text-sm mb-6">
          {merchantName 
            ? `Bonjour ${merchantName}, un agent va valider votre connexion`
            : 'Un agent va valider votre connexion'}
        </p>

        {/* Code de validation */}
        {currentRequest && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-xs text-muted-foreground text-center mb-2">
              Code de validation
            </p>
            <p className="text-3xl font-mono font-bold text-center text-primary tracking-widest">
              {currentRequest.validationCode}
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Communiquez ce code à l'agent si demandé
            </p>
          </div>
        )}

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className={cn(
            'font-mono',
            timeRemaining < 60 ? 'text-red-500' : 'text-muted-foreground'
          )}>
            {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Indicateur d'attente */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            En attente d'un agent...
          </span>
        </div>

        {/* Actions alternatives */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // Appeler le support
              window.location.href = 'tel:+22500000000';
            }}
          >
            <Phone className="h-4 w-4 mr-2" />
            Appeler le support
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onCancel}
          >
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
