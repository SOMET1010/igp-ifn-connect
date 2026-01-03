import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("🎨 Generating market background image...");

    // Prompt détaillé pour une scène de marché ivoirien
    const prompt = `A vibrant African street market scene in Ivory Coast (Côte d'Ivoire).
Colorful market stalls overflowing with tropical fruits: mangoes, papayas, pineapples, bananas, tomatoes.
Women vendors wearing beautiful traditional colorful African dresses (wax prints, pagnes).
Warm golden sunlight filtering through canvas awnings.
Busy, lively atmosphere with people shopping.
Spices displayed in colorful bowls.
Wooden market stalls with produce arranged artfully.
Warm color palette: orange, terracotta, yellow, saffron, green accents.
Photorealistic photography style.
Horizontal landscape format 1920x1080.
Ultra high resolution, cinematic lighting.`;

    // Appeler Lovable AI Gateway avec le modèle d'image
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Image generated successfully");

    // Extraire l'image base64
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageData) {
      throw new Error("No image generated");
    }

    // Extraire le base64 (enlever le préfixe data:image/png;base64,)
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image format");
    }

    const imageFormat = base64Match[1];
    const base64Data = base64Match[2];
    
    // Convertir en Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload vers Supabase Storage
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const fileName = `market-background-${Date.now()}.${imageFormat}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("backgrounds")
      .upload(fileName, bytes, {
        contentType: `image/${imageFormat}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log("📦 Image uploaded to storage:", fileName);

    // Récupérer l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from("backgrounds")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;
    console.log("🔗 Public URL:", publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        fileName,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error generating market background:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
