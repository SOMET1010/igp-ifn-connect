import { supabase } from '@/integrations/supabase/client';

export interface PublicMapEntity {
  id: string;
  type: 'market' | 'cooperative';
  name: string;
  lat: number;
  lng: number;
  details?: string;
  commune?: string;
  region?: string;
}

export const publicMapService = {
  async getMarkets(): Promise<PublicMapEntity[]> {
    const { data, error } = await supabase
      .from('markets')
      .select('id, name, commune, region, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) {
      console.error('Error fetching markets:', error);
      return [];
    }

    return (data || [])
      .filter(m => m.latitude && m.longitude)
      .map(m => ({
        id: m.id,
        type: 'market' as const,
        name: m.name,
        lat: Number(m.latitude),
        lng: Number(m.longitude),
        details: `${m.commune}, ${m.region}`,
        commune: m.commune,
        region: m.region,
      }));
  },

  async getCooperatives(): Promise<PublicMapEntity[]> {
    // Récupérer les coopératives avec GPS
    const { data: coops, error: coopsError } = await supabase
      .from('cooperatives')
      .select('id, name, commune, region, latitude, longitude, total_members')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (coopsError) {
      console.error('Error fetching cooperatives:', coopsError);
    }

    // Récupérer aussi les vivriers_cooperatives avec GPS
    const { data: vivriers, error: vivriersError } = await supabase
      .from('vivriers_cooperatives')
      .select('id, name, commune, region, latitude, longitude, effectif_total')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (vivriersError) {
      console.error('Error fetching vivriers_cooperatives:', vivriersError);
    }

    const coopEntities: PublicMapEntity[] = (coops || [])
      .filter(c => c.latitude && c.longitude)
      .map(c => ({
        id: c.id,
        type: 'cooperative' as const,
        name: c.name,
        lat: Number(c.latitude),
        lng: Number(c.longitude),
        details: c.total_members ? `${c.total_members} membres` : `${c.commune}, ${c.region}`,
        commune: c.commune,
        region: c.region,
      }));

    const vivriersEntities: PublicMapEntity[] = (vivriers || [])
      .filter(v => v.latitude && v.longitude)
      .map(v => ({
        id: v.id,
        type: 'cooperative' as const,
        name: v.name,
        lat: Number(v.latitude),
        lng: Number(v.longitude),
        details: v.effectif_total ? `${v.effectif_total} membres` : `${v.commune || ''}, ${v.region || ''}`,
        commune: v.commune || undefined,
        region: v.region || undefined,
      }));

    return [...coopEntities, ...vivriersEntities];
  },

  async getAllEntities(): Promise<PublicMapEntity[]> {
    const [markets, cooperatives] = await Promise.all([
      this.getMarkets(),
      this.getCooperatives(),
    ]);

    return [...markets, ...cooperatives];
  }
};
