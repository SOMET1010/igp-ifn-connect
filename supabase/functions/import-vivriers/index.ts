import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CooperativeRow {
  name: string;
  code?: string;
  region?: string;
  commune?: string;
  effectif_total?: number;
  effectif_cmu?: number;
  effectif_cnps?: number;
  phone?: string;
  email?: string;
  address?: string;
}

interface MemberRow {
  actor_key: string;
  cooperative_name: string;
  row_number?: number;
  full_name: string;
  identifier_code?: string;
  phone?: string;
  phone2?: string;
  cmu_status?: string;
  cnps_status?: string;
  notes?: string;
}

interface ImportResult {
  table: string;
  inserted: number;
  updated: number;
  rejected: number;
  errors: Array<{ row: number; error: string }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { cooperatives, members, linkMembers } = await req.json();
    
    const results: ImportResult[] = [];
    
    // Import cooperatives
    if (cooperatives && Array.isArray(cooperatives)) {
      console.log(`Importing ${cooperatives.length} cooperatives...`);
      const coopResult: ImportResult = {
        table: 'vivriers_cooperatives',
        inserted: 0,
        updated: 0,
        rejected: 0,
        errors: [],
      };

      const BATCH_SIZE = 500;
      for (let i = 0; i < cooperatives.length; i += BATCH_SIZE) {
        const batch = cooperatives.slice(i, i + BATCH_SIZE);
        
        for (let j = 0; j < batch.length; j++) {
          const coop: CooperativeRow = batch[j];
          const rowIndex = i + j + 1;
          
          try {
            if (!coop.name) {
              coopResult.rejected++;
              coopResult.errors.push({ row: rowIndex, error: 'Missing name' });
              continue;
            }

            // Normalize phone
            const normalizedPhone = coop.phone?.replace(/\D/g, '') || null;

            const { data: existing } = await supabase
              .from('vivriers_cooperatives')
              .select('id')
              .eq('name', coop.name)
              .maybeSingle();

            if (existing) {
              // Update
              const { error } = await supabase
                .from('vivriers_cooperatives')
                .update({
                  code: coop.code || null,
                  region: coop.region || null,
                  commune: coop.commune || null,
                  effectif_total: coop.effectif_total || 0,
                  effectif_cmu: coop.effectif_cmu || 0,
                  effectif_cnps: coop.effectif_cnps || 0,
                  phone: normalizedPhone,
                  email: coop.email || null,
                  address: coop.address || null,
                })
                .eq('id', existing.id);

              if (error) {
                coopResult.rejected++;
                coopResult.errors.push({ row: rowIndex, error: error.message });
              } else {
                coopResult.updated++;
              }
            } else {
              // Insert
              const { error } = await supabase
                .from('vivriers_cooperatives')
                .insert({
                  name: coop.name,
                  code: coop.code || null,
                  region: coop.region || null,
                  commune: coop.commune || null,
                  effectif_total: coop.effectif_total || 0,
                  effectif_cmu: coop.effectif_cmu || 0,
                  effectif_cnps: coop.effectif_cnps || 0,
                  phone: normalizedPhone,
                  email: coop.email || null,
                  address: coop.address || null,
                });

              if (error) {
                coopResult.rejected++;
                coopResult.errors.push({ row: rowIndex, error: error.message });
              } else {
                coopResult.inserted++;
              }
            }
          } catch (err) {
            coopResult.rejected++;
            coopResult.errors.push({ row: rowIndex, error: String(err) });
          }
        }
      }

      console.log(`Cooperatives import complete: ${coopResult.inserted} inserted, ${coopResult.updated} updated, ${coopResult.rejected} rejected`);
      results.push(coopResult);
    }

    // Import members
    if (members && Array.isArray(members)) {
      console.log(`Importing ${members.length} members...`);
      const memberResult: ImportResult = {
        table: 'vivriers_members',
        inserted: 0,
        updated: 0,
        rejected: 0,
        errors: [],
      };

      const BATCH_SIZE = 500;
      for (let i = 0; i < members.length; i += BATCH_SIZE) {
        const batch = members.slice(i, i + BATCH_SIZE);
        
        for (let j = 0; j < batch.length; j++) {
          const member: MemberRow = batch[j];
          const rowIndex = i + j + 1;
          
          try {
            if (!member.actor_key || !member.full_name || !member.cooperative_name) {
              memberResult.rejected++;
              memberResult.errors.push({ 
                row: rowIndex, 
                error: 'Missing required fields (actor_key, full_name, or cooperative_name)' 
              });
              continue;
            }

            // Normalize phone and identifier
            const normalizedPhone = member.phone?.replace(/\D/g, '') || null;
            const normalizedPhone2 = member.phone2?.replace(/\D/g, '') || null;
            const normalizedIdentifier = member.identifier_code?.replace(/\s/g, '') || null;

            const { data: existing } = await supabase
              .from('vivriers_members')
              .select('id')
              .eq('actor_key', member.actor_key)
              .maybeSingle();

            if (existing) {
              // Update
              const { error } = await supabase
                .from('vivriers_members')
                .update({
                  cooperative_name: member.cooperative_name,
                  row_number: member.row_number || null,
                  full_name: member.full_name,
                  identifier_code: normalizedIdentifier,
                  phone: normalizedPhone,
                  phone2: normalizedPhone2,
                  cmu_status: member.cmu_status || null,
                  cnps_status: member.cnps_status || null,
                  notes: member.notes || null,
                })
                .eq('id', existing.id);

              if (error) {
                memberResult.rejected++;
                memberResult.errors.push({ row: rowIndex, error: error.message });
              } else {
                memberResult.updated++;
              }
            } else {
              // Insert
              const { error } = await supabase
                .from('vivriers_members')
                .insert({
                  actor_key: member.actor_key,
                  cooperative_name: member.cooperative_name,
                  row_number: member.row_number || null,
                  full_name: member.full_name,
                  identifier_code: normalizedIdentifier,
                  phone: normalizedPhone,
                  phone2: normalizedPhone2,
                  cmu_status: member.cmu_status || null,
                  cnps_status: member.cnps_status || null,
                  notes: member.notes || null,
                });

              if (error) {
                memberResult.rejected++;
                memberResult.errors.push({ row: rowIndex, error: error.message });
              } else {
                memberResult.inserted++;
              }
            }
          } catch (err) {
            memberResult.rejected++;
            memberResult.errors.push({ row: rowIndex, error: String(err) });
          }
        }
      }

      console.log(`Members import complete: ${memberResult.inserted} inserted, ${memberResult.updated} updated, ${memberResult.rejected} rejected`);
      results.push(memberResult);
    }

    // Link members to cooperatives
    if (linkMembers) {
      console.log('Linking members to cooperatives...');
      const { data, error } = await supabase.rpc('link_vivriers_members');
      
      if (error) {
        console.error('Error linking members:', error);
      } else {
        console.log('Members linked successfully');
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
