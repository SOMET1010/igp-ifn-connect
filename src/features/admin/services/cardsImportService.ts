/**
 * Service d'import de cartes - P.NA.VIM
 * Import des fichiers JSON avec support identifiants alphanumériques
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/shared/services/logger';

export interface CardData {
  numero: number;
  nom_prenoms: string;
  identifiant: string;
  telephone: string;
}

export interface MarketCards {
  market_code: string;
  stats?: {
    participants?: number;
    cards_count?: number;
    [key: string]: unknown;
  };
  cards: CardData[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: string[];
  skipped: number;
}

export interface SearchResult {
  id: string;
  full_name: string;
  identifier_code: string;
  phone: string;
  market_code: string | null;
  cooperative_id: string | null;
  cooperative_name?: string;
}

/**
 * Parse un fichier JSON de cartes
 */
export function parseCardsFile(content: string): MarketCards | MarketCards[] | null {
  try {
    const data = JSON.parse(content);
    
    // Vérifier si c'est un tableau de marchés
    if (Array.isArray(data)) {
      return data.filter(item => 
        item.market_code && Array.isArray(item.cards)
      );
    }
    
    // Vérifier si c'est un seul marché
    if (data.market_code && Array.isArray(data.cards)) {
      return data;
    }
    
    // Format flat (liste de cartes directement)
    if (Array.isArray(data) && data[0]?.identifiant) {
      return {
        market_code: 'IMPORT',
        cards: data,
      };
    }
    
    return null;
  } catch (error) {
    logger.error('CARDS_IMPORT:PARSE_FAILED', error as Error);
    return null;
  }
}

/**
 * Valide une carte
 */
function validateCard(card: CardData): string | null {
  if (!card.identifiant) return 'Identifiant manquant';
  if (!card.nom_prenoms) return 'Nom manquant';
  // Identifiant peut contenir des lettres (ex: 01235A)
  if (!/^[0-9A-Za-z]+$/.test(card.identifiant)) {
    return `Identifiant invalide: ${card.identifiant}`;
  }
  return null;
}

/**
 * Normalise un numéro de téléphone
 */
function normalizePhone(phone: string | undefined): string {
  if (!phone) return '';
  return phone.replace(/\s+/g, '').replace(/^(\+225)?/, '');
}

/**
 * Importe les cartes d'un marché
 */
export async function importCards(marketData: MarketCards): Promise<ImportResult> {
  const traceId = logger.setTraceId();
  logger.info('CARDS_IMPORT:START', { 
    marketCode: marketData.market_code, 
    cardsCount: marketData.cards.length,
    traceId 
  });

  const result: ImportResult = {
    success: false,
    imported: 0,
    duplicates: 0,
    errors: [],
    skipped: 0,
  };

  // Récupérer les identifiants existants pour détecter les doublons
  const { data: existingCards } = await supabase
    .from('vivriers_members')
    .select('identifier_code')
    .eq('market_code', marketData.market_code);

  const existingIds = new Set(existingCards?.map(c => c.identifier_code) || []);

  // Préparer les cartes à importer
  const cardsToImport: Array<{
    full_name: string;
    identifier_code: string;
    phone: string;
    market_code: string;
    actor_key: string;
    cooperative_name: string;
  }> = [];

  for (const card of marketData.cards) {
    // Valider
    const validationError = validateCard(card);
    if (validationError) {
      result.errors.push(`Carte ${card.numero}: ${validationError}`);
      result.skipped++;
      continue;
    }

    // Vérifier doublon
    if (existingIds.has(card.identifiant)) {
      result.duplicates++;
      continue;
    }

    cardsToImport.push({
      full_name: card.nom_prenoms.trim(),
      identifier_code: card.identifiant.trim().toUpperCase(),
      phone: normalizePhone(card.telephone),
      market_code: marketData.market_code,
      actor_key: `${marketData.market_code}-${card.identifiant}`,
      cooperative_name: marketData.market_code, // Utiliser market_code comme cooperative_name
    });
  }

  // Insérer par batch de 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < cardsToImport.length; i += BATCH_SIZE) {
    const batch = cardsToImport.slice(i, i + BATCH_SIZE);
    
    const { error } = await supabase
      .from('vivriers_members')
      .insert(batch);

    if (error) {
      logger.error('CARDS_IMPORT:BATCH_FAILED', error, { batch: i });
      result.errors.push(`Batch ${i / BATCH_SIZE + 1}: ${error.message}`);
    } else {
      result.imported += batch.length;
    }
  }

  result.success = result.errors.length === 0 || result.imported > 0;

  logger.info('CARDS_IMPORT:COMPLETE', { 
    ...result,
    traceId 
  });

  return result;
}

/**
 * Importe plusieurs marchés
 */
export async function importMultipleMarkets(markets: MarketCards[]): Promise<ImportResult> {
  const totalResult: ImportResult = {
    success: false,
    imported: 0,
    duplicates: 0,
    errors: [],
    skipped: 0,
  };

  for (const market of markets) {
    const result = await importCards(market);
    totalResult.imported += result.imported;
    totalResult.duplicates += result.duplicates;
    totalResult.skipped += result.skipped;
    totalResult.errors.push(...result.errors.map(e => `[${market.market_code}] ${e}`));
  }

  totalResult.success = totalResult.imported > 0;
  return totalResult;
}

/**
 * Recherche des cartes
 */
export async function searchCards(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.trim();
  
  // Recherche par identifiant (exact ou prefix)
  const { data: byId } = await supabase
    .from('vivriers_members')
    .select('id, full_name, identifier_code, phone, market_code, cooperative_id')
    .or(`identifier_code.ilike.${normalizedQuery}%,identifier_code.eq.${normalizedQuery.toUpperCase()}`)
    .limit(20);

  // Recherche par nom
  const { data: byName } = await supabase
    .from('vivriers_members')
    .select('id, full_name, identifier_code, phone, market_code, cooperative_id')
    .ilike('full_name', `%${normalizedQuery}%`)
    .limit(20);

  // Recherche par téléphone
  const { data: byPhone } = await supabase
    .from('vivriers_members')
    .select('id, full_name, identifier_code, phone, market_code, cooperative_id')
    .or(`phone.ilike.%${normalizedQuery}%`)
    .limit(20);

  // Combiner et dédupliquer
  const allResults = [...(byId || []), ...(byName || []), ...(byPhone || [])];
  const uniqueResults = Array.from(
    new Map(allResults.map(item => [item.id, item])).values()
  );

  return uniqueResults.slice(0, 50);
}

/**
 * Obtenir les statistiques par marché
 */
export async function getMarketStats(): Promise<Array<{ market_code: string; count: number }>> {
  const { data } = await supabase
    .from('vivriers_members')
    .select('market_code')
    .not('market_code', 'is', null);

  if (!data) return [];

  const stats: Record<string, number> = {};
  for (const row of data) {
    if (row.market_code) {
      stats[row.market_code] = (stats[row.market_code] || 0) + 1;
    }
  }

  return Object.entries(stats)
    .map(([market_code, count]) => ({ market_code, count }))
    .sort((a, b) => b.count - a.count);
}
