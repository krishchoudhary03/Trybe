import type { CopilotResponse, Priority } from '../career/types';

// ─────────────────────────────────────────
// Guards for model output. The model is never trusted: every response is parsed,
// shape-checked, length-limited and stripped of URLs before it reaches the UI.
// ─────────────────────────────────────────

/** Pull a JSON object out of a model reply (handles code fences and surrounding prose). */
export function extractJson(text: string): unknown | null {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

/** Plain text only: no URLs (the model must never invent links), no markdown noise, bounded length. */
export function cleanText(input: unknown, max = 600): string {
  if (typeof input !== 'string') return '';
  const text = input
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\bwww\.\S+/gi, '')
    .replace(/[*_`]{1,3}/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function strList(v: unknown, maxItems = 6, maxLen = 220): string[] | null {
  if (!Array.isArray(v)) return null;
  return v
    .map(x => (isObj(x) ? cleanText(x.title ?? x.text ?? x.topic ?? x.item, maxLen) : cleanText(x, maxLen)))
    .filter(Boolean)
    .slice(0, maxItems);
}

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

export interface CopilotGuards {
  /** Only these opportunity ids are real. */
  opportunityIds: Set<string>;
  /** Skills that exist in TRYBE's skill library. */
  skills: Set<string>;
}

export function validateCopilot(raw: unknown, guards: CopilotGuards): CopilotResponse | null {
  if (!isObj(raw)) return null;
  const answer = cleanText(raw.answer ?? raw.response, 900);
  if (!answer) return null;
  const priority = PRIORITIES.includes(raw.priority as Priority) ? (raw.priority as Priority) : 'medium';
  const skill = typeof raw.skill === 'string' && guards.skills.has(raw.skill) ? raw.skill : undefined;
  const hoursRaw = typeof raw.estimatedHours === 'number' ? raw.estimatedHours : Number(raw.estimatedHours);
  const estimatedHours = Number.isFinite(hoursRaw) && hoursRaw > 0 ? Math.min(200, Math.round(hoursRaw * 2) / 2) : undefined;
  const ids = Array.isArray(raw.opportunityIds)
    ? raw.opportunityIds.filter((id): id is string => typeof id === 'string' && guards.opportunityIds.has(id)).slice(0, 5)
    : [];
  return {
    answer,
    nextBestAction: cleanText(raw.nextBestAction, 160) || undefined,
    reason: cleanText(raw.reason, 300) || undefined,
    priority,
    skill,
    estimatedHours,
    opportunityIds: ids.length ? ids : undefined,
  };
}

export interface MentorAiInsights {
  summary: string;
  strengths: string[];
  concerns: string[];
  discussionTopics: string[];
  actionItems: string[];
}

export function validateMentorInsights(raw: unknown): MentorAiInsights | null {
  if (!isObj(raw)) return null;
  const summary = cleanText(raw.summary, 500);
  const strengths = strList(raw.strengths);
  const concerns = strList(raw.concerns);
  const discussionTopics = strList(raw.discussionTopics);
  const actionItems = strList(raw.actionItems);
  const present = [strengths, concerns, discussionTopics, actionItems].filter(Boolean).length;
  if (!summary || present < 2) return null;
  return {
    summary,
    strengths: strengths ?? [],
    concerns: concerns ?? [],
    discussionTopics: discussionTopics ?? [],
    actionItems: actionItems ?? [],
  };
}

export interface SessionSummaryAi {
  summary: string;
  strengths: string[];
  concerns: string[];
  actionItems: string[];
  nextSessionGoals: string[];
}

export function validateSessionSummary(raw: unknown): SessionSummaryAi | null {
  if (!isObj(raw)) return null;
  const summary = cleanText(raw.summary, 600);
  const strengths = strList(raw.strengths);
  const concerns = strList(raw.concerns);
  const actionItems = strList(raw.actionItems);
  const nextSessionGoals = strList(raw.nextSessionGoals);
  if (!summary || !strengths || !concerns || !actionItems || !nextSessionGoals) return null;
  return { summary, strengths, concerns, actionItems, nextSessionGoals };
}

/** AI may only add a short note per existing phase id — it can't add, remove or reorder tasks. */
export function validateRoadmapNotes(raw: unknown, phaseIds: Set<string>): Record<string, string> | null {
  if (!isObj(raw) || !Array.isArray(raw.phases)) return null;
  const out: Record<string, string> = {};
  for (const p of raw.phases) {
    if (!isObj(p) || typeof p.id !== 'string' || !phaseIds.has(p.id)) continue;
    const note = cleanText(p.note, 220);
    if (note) out[p.id] = note;
  }
  return Object.keys(out).length > 0 ? out : null;
}

export function validateOpportunityExplanation(raw: unknown): string | null {
  if (!isObj(raw)) return null;
  return cleanText(raw.explanation, 500) || null;
}

export interface SkillGapAiExplanation {
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export function validateSkillGapExplanation(raw: unknown): SkillGapAiExplanation | null {
  if (!isObj(raw)) return null;
  const summary = cleanText(raw.summary, 600);
  const strengths = strList(raw.strengths, 4);
  const gaps = strList(raw.gaps, 4);
  const recommendations = strList(raw.recommendations, 4);
  if (!summary || !strengths || !gaps || !recommendations) return null;
  return { summary, strengths, gaps, recommendations };
}
