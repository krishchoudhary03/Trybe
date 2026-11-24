import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadEnv, type Plugin } from 'vite';

/**
 * TRYBE AI Proxy — Groq-first, Gemini-fallback server-side proxy.
 *
 *   GET  /api/ai/status  → { available: boolean, provider: string }
 *   POST /api/ai         → { text }   body: { task, system, prompt, messages? }
 *
 * Groq (Llama 3.3 70B) is the primary provider for ultra-fast multi-turn chat.
 * If Groq is unavailable or fails, falls back to Google Gemini.
 * API keys are server-side only (no VITE_ prefix) — never bundled into the browser.
 */

const MAX_BODY_BYTES = 120_000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;

type Handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string | null> {
  return new Promise(resolve => {
    let size = 0;
    let tooLarge = false;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY_BYTES) {
        if (!tooLarge) {
          tooLarge = true;
          chunks.length = 0;
          resolve(null);
        }
        return;
      }
      if (!tooLarge) chunks.push(c);
    });
    req.on('end', () => resolve(tooLarge ? null : Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => resolve(null));
  });
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ── Groq Provider (Llama 3.3 70B — ultra-fast inference) ──────────────

async function callGroq(
  apiKey: string,
  messages: ChatMessage[],
  model: string,
): Promise<string | null> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.35,
      max_tokens: 2000,
      top_p: 0.9,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? null;
}

// ── Gemini Provider (fallback) ────────────────────────────────────────

async function callGemini(
  apiKey: string,
  system: string,
  prompt: string,
  model: string,
): Promise<string | null> {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model,
      contents: prompt.slice(0, 60_000),
      config: {
        systemInstruction: system.slice(0, 8_000),
        responseMimeType: 'application/json',
        temperature: 0.4,
        maxOutputTokens: 1_500,
      },
    });
    return result.text ?? null;
  } catch {
    return null;
  }
}

// ── Main proxy plugin ─────────────────────────────────────────────────

export function trybeAiProxy(): Plugin {
  let env: Record<string, string> = {};
  const hits = new Map<string, number[]>();

  const groqKey = () => env.GROQ_API_KEY || process.env.GROQ_API_KEY || '';
  const groqModel = () => env.GROQ_MODEL || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const geminiKey = () => env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  const geminiModel = () => env.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const hasProvider = () => Boolean(groqKey() || geminiKey());
  const activeProvider = () => groqKey() ? 'groq' : geminiKey() ? 'gemini' : 'none';

  const handler: Handler = (req, res, next) => {
    const path = (req.url ?? '/').split('?')[0];

    if (req.method === 'GET' && path === '/status') {
      return send(res, 200, { available: hasProvider(), provider: activeProvider() });
    }
    if (req.method !== 'POST' || (path !== '/' && path !== '')) return next();

    void (async () => {
      if (!hasProvider()) return send(res, 503, { error: 'not_configured' });

      // Rate limiting
      const ip = req.socket.remoteAddress ?? 'local';
      const now = Date.now();
      const recent = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
      if (recent.length >= MAX_PER_WINDOW) return send(res, 429, { error: 'rate_limited' });
      hits.set(ip, [...recent, now]);

      const raw = await readBody(req);
      if (raw === null) {
        res.setHeader('Connection', 'close');
        return send(res, 413, { error: 'too_large' });
      }

      let body: {
        system?: unknown;
        prompt?: unknown;
        messages?: unknown;
      };
      try {
        body = JSON.parse(raw);
      } catch {
        return send(res, 400, { error: 'bad_request' });
      }
      if (typeof body.system !== 'string' || typeof body.prompt !== 'string' || !body.prompt.trim()) {
        return send(res, 400, { error: 'bad_request' });
      }

      // Build multi-turn messages array for Groq
      const chatMessages: ChatMessage[] = [];
      chatMessages.push({ role: 'system', content: body.system.slice(0, 10_000) });

      // If the client sent a messages array (multi-turn conversation), use it
      if (Array.isArray(body.messages)) {
        for (const m of body.messages) {
          if (
            typeof m === 'object' && m !== null &&
            typeof (m as ChatMessage).role === 'string' &&
            typeof (m as ChatMessage).content === 'string' &&
            ((m as ChatMessage).role === 'user' || (m as ChatMessage).role === 'assistant')
          ) {
            chatMessages.push({
              role: (m as ChatMessage).role,
              content: (m as ChatMessage).content.slice(0, 8_000),
            });
          }
        }
      }

      // Current question as the final user message
      chatMessages.push({ role: 'user', content: body.prompt.slice(0, 60_000) });

      let text: string | null = null;

      // Try Groq first (primary — ultra-fast)
      if (groqKey()) {
        try {
          text = await callGroq(groqKey(), chatMessages, groqModel());
        } catch {
          text = null;
        }
      }

      // Fallback to Gemini if Groq failed or isn't configured
      if (!text && geminiKey()) {
        try {
          // For Gemini, flatten the conversation into the prompt
          const flatPrompt = chatMessages
            .filter(m => m.role !== 'system')
            .map(m => `${m.role === 'user' ? 'Student' : 'Copilot'}: ${m.content}`)
            .join('\n\n');
          text = await callGemini(geminiKey(), body.system, flatPrompt, geminiModel());
        } catch {
          text = null;
        }
      }

      if (text) {
        return send(res, 200, { text });
      }
      return send(res, 502, { error: 'upstream_error' });
    })();
  };

  return {
    name: 'trybe-ai-proxy',
    config(_, { mode }) {
      env = loadEnv(mode, process.cwd(), '');
    },
    configureServer(server) {
      server.middlewares.use('/api/ai', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/ai', handler);
    },
  };
}
