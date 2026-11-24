import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sessionId, rawNotes } = await req.json();

    if (!sessionId || !rawNotes) {
      return new Response(JSON.stringify({ error: "sessionId and rawNotes are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY secret is not configured");
    }

    const prompt = `You are the TRYBE Mentorship AI Assistant.
Extract a concise session summary and a list of actionable items from these notes taken during a student mentorship call:

Notes:
"${rawNotes}"

Respond strictly in valid JSON format matching this schema:
{
  "summary": "1-2 sentence executive summary of topics discussed",
  "actionItems": [
    { "title": "Action item title", "description": "Brief description" }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API returned status ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const rawJson = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(rawJson);

    // Update mentor session with AI summary
    await supabaseClient
      .from("mentor_sessions")
      .update({
        ai_summary: parsed.summary,
        ai_recommendations: parsed.recommendations || [],
        summary_source: "ai",
      })
      .eq("id", sessionId);

    // Insert extracted action items
    if (parsed.actionItems && Array.isArray(parsed.actionItems)) {
      const actionItemRows = parsed.actionItems.map((item: { title: string; description?: string }) => ({
        session_id: sessionId,
        title: item.title,
        description: item.description || null,
        is_completed: false,
      }));

      await supabaseClient.from("mentor_session_action_items").insert(actionItemRows);
    }

    const latencyMs = Date.now() - startTime;

    return new Response(JSON.stringify({ ...parsed, latencyMs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal Error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
