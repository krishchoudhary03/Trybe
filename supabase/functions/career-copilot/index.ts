// Follow Supabase Edge Function standards (Deno runtime)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase Client with caller's JWT for RLS enforcement
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user identity
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { conversationId, userMessage, deterministicSnapshot } = await req.json();

    if (!userMessage || typeof userMessage !== "string") {
      return new Response(JSON.stringify({ error: "userMessage is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Secure Gemini API Key from server environment (never exposed to browser)
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY server secret is not configured");
    }

    // Record user message in ai_messages table
    if (conversationId) {
      await supabaseClient.from("ai_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: userMessage,
        source: "copilot",
      });
    }

    // Minimal privacy-preserving prompt injection
    const systemPrompt = `You are the TRYBE Career Copilot.
You assist Indian university students with software engineering career guidance.
Base your explanations strictly on the student's verified profile data provided below:
Verified Snapshot: ${JSON.stringify(deterministicSnapshot || {})}
Do not invent skill proficiencies or readiness scores. Give constructive, actionable advice.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nStudent Query: ${userMessage}` }] },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${errText}`);
    }

    const geminiData = await geminiResponse.json();
    const assistantReply =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I'm sorry, I could not generate an answer at this time.";

    const latencyMs = Date.now() - startTime;

    // Record assistant reply in ai_messages
    if (conversationId) {
      await supabaseClient.from("ai_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantReply,
        source: "copilot",
        model: "gemini-1.5-flash",
        latency_ms: latencyMs,
        token_usage: geminiData.usageMetadata || null,
      });

      // Increment message count on ai_conversations
      await supabaseClient.rpc("send_message", {
        p_conversation_id: conversationId,
        p_content: assistantReply,
      }).catch(() => null);
    }

    // Record audit telemetry in ai_runs
    await supabaseClient.from("ai_runs").insert({
      user_id: user.id,
      feature: "copilot",
      conversation_id: conversationId || null,
      status: "completed",
      model: "gemini-1.5-flash",
      prompt_version: "v1.0.0",
      latency_ms: latencyMs,
      token_usage: geminiData.usageMetadata || null,
    });

    return new Response(
      JSON.stringify({
        reply: assistantReply,
        latencyMs,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    console.error("Career Copilot Edge Function error:", err);

    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal Server Error",
        latencyMs,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
