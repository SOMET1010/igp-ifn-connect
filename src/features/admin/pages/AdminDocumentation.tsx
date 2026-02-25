/**
 * Page d'administration - Générateur de Documentation PDF
 */

import React from 'react';
import { ArrowLeft, FileText, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DocumentationPDFGenerator } from '../components/documentation';

const AdminDocumentation: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Documentation PDF
              </h1>
              <p className="text-sm text-muted-foreground">
                Générez la documentation complète de JÙLABA
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="container mx-auto px-4 py-6">
        {/* Instructions */}
        <Alert className="mb-6">
          <HelpCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Comment utiliser ce générateur :</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Parcourez les sections et pages ci-dessous</li>
              <li>Uploadez des captures d'écran pour chaque page (optionnel)</li>
              <li>Sélectionnez les sections à inclure dans le PDF</li>
              <li>Cliquez sur "Générer le PDF" pour télécharger le document</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Générateur */}
        <DocumentationPDFGenerator />
      </main>
    </div>
  );
};

export default AdminDocumentation;
