import type { StudentSnapshot } from '../career/types';
import { requestAiJson, toOutcome, type AiOutcome } from './aiService';
import { roadmapPrompt } from './prompts';
import { extractJson, validateRoadmapNotes } from './validators';

/** Rules-based phase notes (skipped content, adaptations). */
export function roadmapNotesLocally(snap: StudentSnapshot): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of snap.student.roadmap?.phases ?? []) {
    if (p.adaptiveNote) out[p.id] = p.adaptiveNote;
    else {
      const skipped = p.tasks.filter(t => t.status === 'skipped').length;
      if (skipped > 0 && p.status !== 'proficient') out[p.id] = `${skipped} task${skipped > 1 ? 's were' : ' was'} skipped because you already cover that material.`;
      if (p.status === 'proficient') out[p.id] = 'You already meet the target here, so this phase needs no time.';
    }
  }
  return out;
}

/**
 * The roadmap *structure* (phases, tasks, hours, skipping, adaptation) is computed by the
 * engine. AI only adds a short coaching note per existing phase id.
 */
export async function generateRoadmapNotes(
  snap: StudentSnapshot,
  opts: { fresh?: boolean } = {},
): Promise<AiOutcome<Record<string, string>>> {
  const fallback = roadmapNotesLocally(snap);
  const ids = new Set((snap.student.roadmap?.phases ?? []).map(p => p.id));
  const { system, prompt } = roadmapPrompt(snap);
  const result = await requestAiJson({
    task: 'roadmap', system, prompt, fresh: opts.fresh, parse: extractJson, validate: raw => validateRoadmapNotes(raw, ids),
  });
  const outcome = toOutcome(result, fallback);
  if (outcome.source !== 'ai') return outcome;
  // Adaptive notes are facts about the student's results — the engine's wording always wins over the AI's.
  const facts: Record<string, string> = {};
  for (const p of snap.student.roadmap?.phases ?? []) if (p.adaptiveNote) facts[p.id] = p.adaptiveNote;
  return { ...outcome, data: { ...fallback, ...outcome.data, ...facts } };
}
