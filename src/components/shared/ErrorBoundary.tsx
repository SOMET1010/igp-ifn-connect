import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/infra/logger';
import { getSentry } from '@/shared/types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log structuré avec le logger centralisé
    logger.error('ErrorBoundary caught an error', error, {
      module: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
      errorName: error.name,
    });

    this.setState({ errorInfo });

    // Sentry integration (si configuré)
    const sentry = getSentry();
    if (sentry) {
      sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } },
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleContactSupport = () => {
    // Ouvre WhatsApp avec message pré-rempli
    const message = encodeURIComponent(
      `Bonjour, j'ai rencontré une erreur sur l'application PNAVIM: ${this.state.error?.message || 'Erreur inconnue'}`
    );
    window.open(`https://wa.me/22500000000?text=${message}`, '_blank');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>

            {/* Message simple et clair */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Oups, quelque chose ne va pas
              </h1>
              <p className="text-muted-foreground">
                L'application a rencontré un problème. 
                Pas d'inquiétude, tes données sont en sécurité.
              </p>
            </div>

            {/* Error details (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <p className="text-sm font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={this.handleRetry}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>

              <Button
                onClick={this.handleContactSupport}
                variant="ghost"
                className="w-full"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contacter le support
              </Button>
            </div>

            {/* Info supplémentaire */}
            <p className="text-xs text-muted-foreground">
              Si le problème persiste, contacte le support au{' '}
              <span className="font-medium">+225 00 00 00 00</span>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
