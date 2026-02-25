/**
 * Page Admin Recherche Cartes - JÙLABA
 * Recherche avec support identifiants alphanumériques
 */

import { useState, useCallback, useEffect } from 'react';
import { Search, User, Phone, CreditCard, MapPin, Download, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedHeader } from '@/shared/ui';
import { toast } from 'sonner';
import { 
  searchCards, 
  getMarketStats,
  type SearchResult 
} from '@/features/admin/services/cardsImportService';

export default function AdminCardsSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [marketStats, setMarketStats] = useState<Array<{ market_code: string; count: number }>>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Charger les stats au montage
  useEffect(() => {
    getMarketStats().then(setMarketStats);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query || query.length < 2) {
      toast.error('Entrez au moins 2 caractères');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const data = await searchCards(query);
      setResults(data);
      
      if (data.length === 0) {
        toast.info('Aucun résultat trouvé');
      }
    } catch (error) {
      toast.error('Erreur lors de la recherche');
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const exportResults = () => {
    if (results.length === 0) return;

    const csv = [
      'Nom,Identifiant,Téléphone,Marché',
      ...results.map(r => 
        `"${r.full_name}","${r.identifier_code}","${r.phone}","${r.market_code || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `julaba_cartes_${query}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Export téléchargé');
  };

  const totalCards = marketStats.reduce((acc, m) => acc + m.count, 0);

  return (
    <div className="min-h-screen bg-background">
      <EnhancedHeader title="Recherche Cartes" showBack backTo="/admin" />
      
      <div className="p-4 space-y-6 pb-24">
        {/* Stats */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalCards.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">cartes en base</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {marketStats.slice(0, 5).map(m => (
                  <Badge key={m.market_code} variant="outline" className="text-xs">
                    {m.market_code}: {m.count}
                  </Badge>
                ))}
                {marketStats.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{marketStats.length - 5}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Barre de recherche */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, identifiant ou téléphone..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Supporte les identifiants alphanumériques (ex: 01235A, 12345B)
            </p>
          </CardContent>
        </Card>

        {/* Résultats */}
        {hasSearched && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">
                Résultats ({results.length})
              </CardTitle>
              {results.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun résultat pour "{query}"
                </p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {results.map((card) => (
                      <div 
                        key={card.id}
                        className="p-4 bg-muted/50 rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{card.full_name}</span>
                          </div>
                          {card.market_code && (
                            <Badge variant="outline">{card.market_code}</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CreditCard className="w-4 h-4" />
                            <span className="font-mono">{card.identifier_code}</span>
                          </div>
                          {card.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{card.phone}</span>
                            </div>
                          )}
                        </div>

                        {card.cooperative_id && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>Coopérative: {card.cooperative_name || card.cooperative_id}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!hasSearched && (
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <h3 className="font-medium mb-2">Comment rechercher ?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Par identifiant: <code className="bg-muted px-1 rounded">01235A</code></li>
                <li>• Par nom: <code className="bg-muted px-1 rounded">KOFFI</code></li>
                <li>• Par téléphone: <code className="bg-muted px-1 rounded">0701234567</code></li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
