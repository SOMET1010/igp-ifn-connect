/**
 * Types pour l'authentification contextuelle et le trust scoring
 */

import type { Json } from '@/integrations/supabase/types';

// ============================================
// TRUST SCORE TYPES
// ============================================

export interface TrustFactors {
  deviceKnown: boolean;
  deviceScore: number;
  timeMatch: boolean;
  timeScore: number;
  geoMatch: boolean;
  geoScore: number;
  historyScore: number;
}

export interface RawTrustFactors {
  device_known?: boolean;
  device_score?: number;
  time_match?: boolean;
  time_score?: number;
  geo_match?: boolean;
  geo_score?: number;
  history_score?: number;
}

export type AuthDecision = 'direct_access' | 'challenge' | 'human_fallback';

export interface TrustScoreResult {
  score: number;
  factors: TrustFactors;
  decision: AuthDecision;
  merchantId?: string;
  merchantName?: string;
}

// ============================================
// AUTH CONTEXT SCORES (DB Row)
// ============================================

export interface AuthContextScore {
  merchant_id: string;
  device_fingerprint: string | null;
  device_name: string | null;
  is_primary_device: boolean | null;
  trust_score: number | null;
  trust_score_updated_at: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  successful_logins: number | null;
  failed_logins: number | null;
  usual_login_hours_start: number | null;
  usual_login_hours_end: number | null;
  usual_days_of_week: number[] | null;
  usual_gps_latitude: number | null;
  usual_gps_longitude: number | null;
  gps_tolerance_meters: number | null;
  usual_market_id: string | null;
}

// ============================================
// AUTH LOGGING TYPES
// ============================================

export interface AuthLogEntry {
  phone: string;
  decision: AuthDecision;
  trust_score?: number;
  factors?: Json;
  merchant_id?: string;
  market_code?: string;
  device_fingerprint?: string;
  ip_address?: string;
  user_agent?: string;
  latitude?: number;
  longitude?: number;
  hour_bucket?: number;
  reason_codes?: Json;
}

export type AuthOutcome = 'success' | 'failed' | 'challenge_passed' | 'challenge_failed' | 'abandoned';

// ============================================
// RISK EVENTS
// ============================================

export type RiskEventType = 
  | 'new_device'
  | 'unusual_time'
  | 'unusual_location'
  | 'low_trust_score'
  | 'multiple_failures';

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RiskEventEntry {
  merchant_id: string;
  event_type: RiskEventType;
  severity: RiskSeverity;
  details?: Json;
}

// ============================================
// HELPER - Parse Raw Factors
// ============================================

export function parseRawTrustFactors(raw: unknown): TrustFactors {
  const factors = raw as RawTrustFactors | null | undefined;
  
  return {
    deviceKnown: factors?.device_known ?? false,
    deviceScore: factors?.device_score ?? 0,
    timeMatch: factors?.time_match ?? false,
    timeScore: factors?.time_score ?? 0,
    geoMatch: factors?.geo_match ?? false,
    geoScore: factors?.geo_score ?? 0,
    historyScore: factors?.history_score ?? 0,
  };
}
