/**
 * Types pour l'assistant vocal unifié
 * Module: voice-assistant
 */

// États de l'assistant vocal
export type VoiceAssistantState = 
  | 'idle'           // En attente
  | 'listening'      // Écoute active
  | 'processing'     // Analyse en cours
  | 'confirming'     // Attente confirmation
  | 'success'        // Action réussie
  | 'error';         // Erreur

// Modes de l'assistant
export type VoiceMode = 'cashier' | 'article' | 'stock';

// Intent de vente
export interface SaleIntent {
  intent: 'SALE_CREATE';
  productName?: string;
  unit?: 'bassine' | 'sac' | 'panier' | 'tas' | 'piece' | 'kg';
  quantity?: number;
  amountXOF?: number;
  confidence: number;
}

// Intent de contrôle
export type ControlIntent = 
  | { intent: 'CONFIRM'; confidence: number }
  | { intent: 'CANCEL'; confidence: number }
  | { intent: 'REPEAT'; confidence: number }
  | { intent: 'HELP'; confidence: number }
  | { intent: 'UNDO'; confidence: number };

// Intent de stock
export interface StockIntent {
  intent: 'STOCK_ADD' | 'STOCK_CHECK' | 'STOCK_ALERT';
  productName?: string;
  quantity?: number;
  confidence: number;
}

// Intent d'article/produit
export interface ArticleIntent {
  intent: 'ARTICLE_CREATE' | 'ARTICLE_PRICE' | 'ARTICLE_DELETE';
  productName?: string;
  price?: number;
  unit?: string;
  confidence: number;
}

// Union de tous les intents
export type VoiceIntent = SaleIntent | ControlIntent | StockIntent | ArticleIntent;

// Résultat du parsing
export interface ParseResult {
  success: boolean;
  intent?: VoiceIntent;
  rawText: string;
  normalizedText: string;
  numbers: number[];
  error?: string;
}

// Configuration TTS
export interface TTSConfig {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

// Événement de transcription
export interface TranscriptionEvent {
  text: string;
  isFinal: boolean;
  confidence: number;
  timestamp: number;
}

// Historique de commande vocale
export interface VoiceCommand {
  id: string;
  timestamp: number;
  rawText: string;
  intent: VoiceIntent;
  status: 'pending' | 'confirmed' | 'cancelled';
  mode: VoiceMode;
}

// Props pour le BigMicButton
export interface BigMicButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  isOffline?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onRelease?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}

// Props pour RecapCard
export interface RecapCardProps {
  mode: VoiceMode;
  command?: VoiceCommand;
  onConfirm: () => void;
  onCancel: () => void;
  onRepeat: () => void;
}
