import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    console.log("Starting mascot generation with Lovable AI...");

    // Prompt détaillé pour générer Tantie Sagesse
    const prompt = `Create a friendly African woman mascot character in 3D cartoon Pixar style.
She has warm brown skin and a welcoming, motherly smile.
She wears colorful traditional African dress in orange and terracotta colors with subtle geometric patterns.
In one hand she holds a woven basket overflowing with tropical fruits: mangoes, papayas, and bananas.
In her other hand she holds a modern smartphone.
The character should look wise, approachable and nurturing - like a beloved market auntie.
Soft warm lighting with an orange glow.
Clean solid white background.
Professional mascot design suitable for a business application.
Full body or 3/4 view, facing slightly towards the camera.
High quality 3D rendering, vibrant colors, friendly expression.`;

    // Appeler Lovable AI Gateway pour générer l'image
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
    console.log("AI response received");

    // Extraire l'image de la réponse
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageData) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image generated");
    }

    console.log("Image generated successfully, uploading to storage...");

    // Créer le client Supabase avec service role pour upload
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Convertir base64 en Uint8Array
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload vers le bucket mascots
    const fileName = `tantie-sagesse-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("mascots")
      .upload(fileName, bytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log("Upload successful:", uploadData.path);

    // Obtenir l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from("mascots")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;
    console.log("Public URL:", publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: publicUrl,
        fileName: fileName,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-mascot:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
