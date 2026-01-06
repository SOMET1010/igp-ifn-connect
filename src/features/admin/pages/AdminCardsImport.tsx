/**
 * Page Admin Import Cartes - P.NA.VIM
 * Import JSON avec support identifiants alphanumériques
 */

import { useState, useCallback } from 'react';
import { Upload, FileJson, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedHeader } from '@/shared/ui';
import { toast } from 'sonner';
import { 
  parseCardsFile, 
  importCards, 
  importMultipleMarkets,
  type MarketCards,
  type ImportResult 
} from '@/features/admin/services/cardsImportService';

export default function AdminCardsImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<MarketCards | MarketCards[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.json')) {
      toast.error('Veuillez sélectionner un fichier JSON');
      return;
    }

    setFile(selectedFile);
    setResult(null);

    try {
      const content = await selectedFile.text();
      const data = parseCardsFile(content);
      
      if (!data) {
        toast.error('Format de fichier invalide');
        setParsedData(null);
        return;
      }

      setParsedData(data);
      toast.success('Fichier chargé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la lecture du fichier');
      console.error(error);
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (!parsedData) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      let importResult: ImportResult;

      if (Array.isArray(parsedData)) {
        // Multi-marchés
        const total = parsedData.length;
        let processed = 0;
        
        const results: ImportResult = {
          success: false,
          imported: 0,
          duplicates: 0,
          errors: [],
          skipped: 0,
        };

        for (const market of parsedData) {
          const r = await importCards(market);
          results.imported += r.imported;
          results.duplicates += r.duplicates;
          results.skipped += r.skipped;
          results.errors.push(...r.errors.map(e => `[${market.market_code}] ${e}`));
          
          processed++;
          setImportProgress((processed / total) * 100);
        }

        results.success = results.imported > 0;
        importResult = results;
      } else {
        // Marché unique
        importResult = await importCards(parsedData);
        setImportProgress(100);
      }

      setResult(importResult);

      if (importResult.success) {
        toast.success(`${importResult.imported} cartes importées`);
      } else {
        toast.error('Erreurs lors de l\'import');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'import');
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  }, [parsedData]);

  const reset = () => {
    setFile(null);
    setParsedData(null);
    setResult(null);
    setImportProgress(0);
  };

  const getPreviewData = () => {
    if (!parsedData) return null;
    
    if (Array.isArray(parsedData)) {
      return {
        type: 'multi',
        markets: parsedData.length,
        totalCards: parsedData.reduce((acc, m) => acc + m.cards.length, 0),
        preview: parsedData.slice(0, 3).map(m => ({
          code: m.market_code,
          count: m.cards.length,
          sample: m.cards.slice(0, 2),
        })),
      };
    }

    return {
      type: 'single',
      market: parsedData.market_code,
      totalCards: parsedData.cards.length,
      sample: parsedData.cards.slice(0, 5),
    };
  };

  const preview = getPreviewData();

  return (
    <div className="min-h-screen bg-background">
      <EnhancedHeader title="Import Cartes" showBack backTo="/admin" />
      
      <div className="p-4 space-y-6 pb-24">
        {/* Zone d'upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Importer un fichier JSON
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileJson className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {file ? file.name : 'Cliquez pour sélectionner un fichier JSON'}
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".json"
                  onChange={handleFileSelect}
                />
              </label>

              <p className="text-xs text-muted-foreground">
                Format attendu: {`{ market_code: "...", cards: [{ numero, nom_prenoms, identifiant, telephone }] }`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Aperçu */}
        {preview && (
          <Card>
            <CardHeader>
              <CardTitle>Aperçu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preview.type === 'multi' ? (
                  <>
                    <div className="flex gap-4">
                      <Badge variant="outline">{preview.markets} marchés</Badge>
                      <Badge variant="outline">{preview.totalCards} cartes au total</Badge>
                    </div>
                    <div className="space-y-2">
                      {preview.preview.map((m: { code: string; count: number }) => (
                        <div key={m.code} className="flex justify-between p-2 bg-muted/50 rounded">
                          <span className="font-mono">{m.code}</span>
                          <span>{m.count} cartes</span>
                        </div>
                      ))}
                      {preview.markets > 3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          ... et {preview.markets - 3} autres marchés
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-4">
                      <Badge variant="outline">{preview.market}</Badge>
                      <Badge variant="outline">{preview.totalCards} cartes</Badge>
                    </div>
                    <ScrollArea className="h-40">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">#</th>
                            <th className="text-left p-2">Nom</th>
                            <th className="text-left p-2">ID</th>
                            <th className="text-left p-2">Tél</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.sample.map((card: { numero: number; nom_prenoms: string; identifiant: string; telephone: string }) => (
                            <tr key={card.numero} className="border-b">
                              <td className="p-2">{card.numero}</td>
                              <td className="p-2">{card.nom_prenoms}</td>
                              <td className="p-2 font-mono">{card.identifiant}</td>
                              <td className="p-2">{card.telephone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        {isImporting && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Import en cours...</span>
                  <span>{Math.round(importProgress)}%</span>
                </div>
                <Progress value={importProgress} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Résultat */}
        {result && (
          <Card className={result.success ? 'border-green-500' : 'border-red-500'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                Résultat de l'import
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                  <p className="text-sm text-muted-foreground">Importées</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">{result.duplicates}</p>
                  <p className="text-sm text-muted-foreground">Doublons</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-500">
                    Erreurs ({result.errors.length}):
                  </p>
                  <ScrollArea className="h-24">
                    {result.errors.map((err, i) => (
                      <p key={i} className="text-xs text-muted-foreground">{err}</p>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          {parsedData && !isImporting && (
            <Button 
              className="flex-1" 
              onClick={handleImport}
              disabled={isImporting}
            >
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
          )}
          {(file || result) && (
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Nouveau fichier
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
