import { supabase } from '@/integrations/supabase/client';
import type { MapEntity } from '../types/map.types';

export const mapService = {
  async getMerchants(): Promise<MapEntity[]> {
    const { data } = await supabase
      .from('merchants')
      .select('id, full_name, activity_type, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (!data) return [];

    return data
      .filter(m => m.latitude && m.longitude)
      .map(m => ({
        id: m.id,
        type: 'merchant' as const,
        name: m.full_name,
        lat: Number(m.latitude),
        lng: Number(m.longitude),
        details: m.activity_type,
      }));
  },

  async getCooperatives(): Promise<MapEntity[]> {
    const { data } = await supabase
      .from('cooperatives')
      .select('id, name, region, commune, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (!data) return [];

    return data
      .filter(c => c.latitude && c.longitude)
      .map(c => ({
        id: c.id,
        type: 'cooperative' as const,
        name: c.name,
        lat: Number(c.latitude),
        lng: Number(c.longitude),
        details: `${c.commune}, ${c.region}`,
      }));
  },

  async getMarkets(): Promise<MapEntity[]> {
    const { data } = await supabase
      .from('markets')
      .select('id, name, commune, region, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (!data) return [];

    return data
      .filter(m => m.latitude && m.longitude)
      .map(m => ({
        id: m.id,
        type: 'market' as const,
        name: m.name,
        lat: Number(m.latitude),
        lng: Number(m.longitude),
        details: `${m.commune}, ${m.region}`,
      }));
  },

  async getAllEntities(): Promise<MapEntity[]> {
    const [merchants, cooperatives, markets] = await Promise.all([
      this.getMerchants(),
      this.getCooperatives(),
      this.getMarkets(),
    ]);

    return [...merchants, ...cooperatives, ...markets];
  }
};
