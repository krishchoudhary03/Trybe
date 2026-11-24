import { hashString } from '../career/engine/util';

// ─────────────────────────────────────────
// Single entry point for every AI call in TRYBE.
// UI components never talk to a model directly and never contain prompts.
//
// The browser only ever talks to a TRYBE endpoint (default `/api/ai`, served by
// server/aiProxy.ts in `npm run dev` / `npm run preview`). The model API key lives
// on that server (GEMINI_API_KEY) and is never bundled into client code.
// ─────────────────────────────────────────

const BASE: string =
  ((import.meta.env?.VITE_AI_ENDPOINT as string | undefined) ?? '').replace(/\/$/, '') || '/api/ai';

const CACHE_KEY = 'trybee_ai_cache';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_MAX = 40;

export type AiFailure = 'unavailable' | 'network' | 'timeout' | 'invalid';
export type AiResult<T> = { ok: true; data: T; cached: boolean } | { ok: false; reason: AiFailure };
export type AiStatus = 'ok' | 'unavailable' | 'failed';

/** What features hand to the UI: always has usable `data`, plus where it came from. */
export interface AiOutcome<T> {
  data: T;
  source: 'ai' | 'rules';
  status: AiStatus;
}

export type AiTask = 'copilot' | 'roadmap' | 'skillGap' | 'opportunity' | 'mentor' | 'sessionSummary';

// ── availability ────────────────────────────────────────────────────────

let availability: { value: boolean; checkedAt: number } | null = null;

export async function isAiAvailable(force = false): Promise<boolean> {
  if (!force && availability && Date.now() - availability.checkedAt < (availability.value ? 10 * 60_000 : 30_000)) {
    return availability.value;
  }
  try {
    const res = await fetch(`${BASE}/status`, { headers: { Accept: 'application/json' } });
    const json = res.ok ? ((await res.json()) as { available?: boolean }) : null;
    availability = { value: Boolean(json?.available), checkedAt: Date.now() };
  } catch {
    availability = { value: false, checkedAt: Date.now() };
  }
  return availability.value;
}

// ── cache (persisted via localStorage, same mechanism as the rest of TRYBE) ──

interface CacheEntry {
  t: number;
  data: unknown;
}

function readCache(): Record<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CacheEntry>) : {};
  } catch {
    return {};
  }
}

function writeCache(key: string, data: unknown): void {
  try {
    const all = readCache();
    all[key] = { t: Date.now(), data };
    const keep = Object.entries(all)
      .filter(([, v]) => Date.now() - v.t < CACHE_TTL_MS)
      .sort((a, b) => b[1].t - a[1].t)
      .slice(0, CACHE_MAX);
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(keep)));
  } catch {
    /* quota — caching is best-effort */
  }
}

export function clearAiCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

// ── JSON request ────────────────────────────────────────────────────────

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiRequest<T> {
  task: AiTask;
  system: string;
  prompt: string;
  /** Optional multi-turn conversation messages */
  messages?: AiChatMessage[];
  /** Returns the typed value, or null when the model output is unusable. */
  validate: (raw: unknown) => T | null;
  /** Skip the cache (e.g. user pressed "Try again"). */
  fresh?: boolean;
  timeoutMs?: number;
  parse: (text: string) => unknown | null;
}

export async function requestAiJson<T>(req: AiRequest<T>): Promise<AiResult<T>> {
  if (!(await isAiAvailable())) return { ok: false, reason: 'unavailable' };

  // Only use cache when there are no dynamic conversation messages and not requested fresh
  const hasHistory = Boolean(req.messages && req.messages.length > 0);
  const key = hashString(`${req.task}|${req.system}|${req.prompt}|${JSON.stringify(req.messages ?? [])}`);
  if (!req.fresh && !hasHistory) {
    const hit = readCache()[key];
    if (hit && Date.now() - hit.t < CACHE_TTL_MS) {
      const data = req.validate(hit.data);
      if (data) return { ok: true, data, cached: true };
    }
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), req.timeoutMs ?? 25_000);
  try {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        task: req.task,
        system: req.system,
        prompt: req.prompt,
        messages: req.messages,
      }),
      signal: ctrl.signal,
    });
    if (res.status === 503) {
      availability = { value: false, checkedAt: Date.now() };
      return { ok: false, reason: 'unavailable' };
    }
    if (!res.ok) return { ok: false, reason: 'network' };
    const body = (await res.json()) as { text?: unknown };
    if (typeof body.text !== 'string') return { ok: false, reason: 'invalid' };
    const raw = req.parse(body.text);
    const data = raw === null ? null : req.validate(raw);
    if (!data) return { ok: false, reason: 'invalid' };
    writeCache(key, raw);
    return { ok: true, data, cached: false };
  } catch (e) {
    return { ok: false, reason: (e as { name?: string })?.name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}

export function failureOutcome<T>(reason: AiFailure, fallback: T): AiOutcome<T> {
  return { data: fallback, source: 'rules', status: reason === 'unavailable' ? 'unavailable' : 'failed' };
}

/** Turn an AI attempt into an outcome with a guaranteed rules-based fallback. */
export function toOutcome<T>(result: AiResult<T>, fallback: T): AiOutcome<T> {
  if ('data' in result) return { data: result.data, source: 'ai', status: 'ok' };
  return failureOutcome(result.reason, fallback);
}

/** Stable signature of the inputs an AI explanation depends on (used to avoid re-calling on every render). */
export function signatureOf(...parts: unknown[]): string {
  return hashString(JSON.stringify(parts));
}
