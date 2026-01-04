import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Singleton pattern: Create client once at module level
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Normalise une réponse pour stockage et comparaison tolérante
 * - Minuscules
 * - Sans accents  
 * - Sans espaces/caractères spéciaux
 */
function normalizeAnswer(answer: string): string {
  if (!answer) return '';
  
  return answer
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Enlever accents
    .replace(/[^a-z0-9]/g, "")       // Garder que lettres/chiffres
    .trim();
}

/**
 * Hash SHA-256 de la réponse normalisée
 */
async function hashAnswer(answer: string): Promise<string> {
  const normalized = normalizeAnswer(answer);
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { merchant_id, questions } = await req.json();

    if (!merchant_id || !questions || !Array.isArray(questions)) {
      throw new Error("merchant_id and questions array required");
    }

    console.log(`[save-security-questions] Saving ${questions.length} questions for merchant ${merchant_id}`);

    // Process all questions in parallel
    const validQuestions = questions.filter(q => q.question_type && q.answer);
    
    const processedQuestions = await Promise.all(
      validQuestions.map(async (q) => {
        const [answerHash, answerNormalized] = await Promise.all([
          hashAnswer(q.answer),
          Promise.resolve(normalizeAnswer(q.answer))
        ]);

        return {
          merchant_id,
          question_type: q.question_type,
          question_text: q.question_text || q.question_type,
          question_text_dioula: q.question_text_dioula || null,
          answer_hash: answerHash,
          answer_normalized: answerNormalized,
          is_active: true
        };
      })
    );

    // Bulk insert all questions at once
    const { data, error } = await supabase
      .from("merchant_security_questions")
      .insert(processedQuestions)
      .select("id, question_type");

    if (error) {
      console.error(`[save-security-questions] Error saving questions:`, error);
      throw error;
    }

    const results = data?.map(d => ({
      id: d.id,
      question_type: d.question_type,
      saved: true
    })) || [];

    console.log(`[save-security-questions] Successfully saved ${results.length} questions`);

    return new Response(
      JSON.stringify({ success: true, saved: results.length, questions: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[save-security-questions] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
