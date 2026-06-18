import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image_base64, file_name, mime_type } = await req.json();

    if (!image_base64) {
      return new Response(JSON.stringify({ error: "Missing image data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Gemini API key is not configured on server" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Gemini 1.5 Flash API directly using HTTP client
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: `Analyze this image file named "${file_name}". Extract any OCR text content, categorize it ('Education', 'Career', 'Health', 'Finance', 'Personal', 'Important Documents', 'Saved Links', or 'AI Generated'), generate tags, suggest relationships, and derive any calendar reminders or expiration dates. Return JSON strictly match: {"category": "...", "priority_score": 50, "tags": [], "summary": "...", "relationships": [], "reminders": []}`
            },
            {
              inlineData: {
                mimeType: mime_type || "image/png",
                data: image_base64
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    const responseData = await response.json();
    const responseText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean potential markdown wrappers
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.substring(7);
    }
    if (cleanJson.endsWith("```")) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }
    cleanJson = cleanJson.trim();

    return new Response(cleanJson, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
