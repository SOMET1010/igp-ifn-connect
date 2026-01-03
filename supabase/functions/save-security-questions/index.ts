import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results = [];

    for (const q of questions) {
      if (!q.question_type || !q.answer) {
        console.log(`[save-security-questions] Skipping question with missing data:`, q);
        continue;
      }

      const answerHash = await hashAnswer(q.answer);
      const answerNormalized = normalizeAnswer(q.answer);

      console.log(`[save-security-questions] Saving question type: ${q.question_type}`);

      const { data, error } = await supabase.from("merchant_security_questions").insert({
        merchant_id,
        question_type: q.question_type,
        question_text: q.question_text || q.question_type,
        question_text_dioula: q.question_text_dioula || null,
        answer_hash: answerHash,
        answer_normalized: answerNormalized,
        is_active: true
      }).select().single();

      if (error) {
        console.error(`[save-security-questions] Error saving question:`, error);
        throw error;
      }

      results.push({
        id: data.id,
        question_type: q.question_type,
        saved: true
      });
    }

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
