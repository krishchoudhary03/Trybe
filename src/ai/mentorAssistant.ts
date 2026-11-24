import type { MentorInsights, SessionSummary, StudentSnapshot } from '../career/types';
import { buildMentorInsights, fallbackSessionSummary } from '../career/engine/mentor';
import { failureOutcome, requestAiJson, toOutcome, type AiOutcome } from './aiService';
import { mentorPrompt, sessionSummaryPrompt } from './prompts';
import { extractJson, validateMentorInsights, validateSessionSummary } from './validators';

/**
 * Mentor briefing. The deterministic insights are always available; AI sharpens the wording
 * and prioritisation but action items keep the engine's real ids / skills when titles match.
 */
export async function generateMentorInsights(
  snap: StudentSnapshot,
  opts: { fresh?: boolean } = {},
): Promise<AiOutcome<MentorInsights>> {
  const base = buildMentorInsights(snap);
  const { system, prompt } = mentorPrompt(snap, {
    strengths: base.strengths, concerns: base.concerns, discussionTopics: base.discussionTopics,
  });
  const result = await requestAiJson({
    task: 'mentor', system, prompt, fresh: opts.fresh, parse: extractJson, validate: validateMentorInsights,
  });
  if (!('data' in result)) return failureOutcome(result.reason, base);
  const ai = result.data;
  const merged: MentorInsights = {
    summary: ai.summary,
    strengths: ai.strengths.length ? ai.strengths : base.strengths,
    concerns: ai.concerns.length ? ai.concerns : base.concerns,
    discussionTopics: ai.discussionTopics.length ? ai.discussionTopics : base.discussionTopics,
    actionItems: ai.actionItems.length
      ? ai.actionItems.map((title, i) => ({
          id: `ai-action-${i}`,
          title,
          reason: base.actionItems[i]?.reason ?? 'Suggested by TRYBE AI from the student’s data.',
          estimatedHours: base.actionItems[i]?.estimatedHours ?? 2,
          skill: base.actionItems[i]?.skill,
        }))
      : base.actionItems,
  };
  return { data: merged, source: 'ai', status: 'ok' };
}

export async function generateSessionSummary(
  snap: StudentSnapshot,
  notes: string,
  opts: { fresh?: boolean } = {},
): Promise<AiOutcome<SessionSummary>> {
  const insights = buildMentorInsights(snap);
  const fallback = fallbackSessionSummary(snap, insights, notes);
  const { system, prompt } = sessionSummaryPrompt(snap, notes);
  const result = await requestAiJson({
    task: 'sessionSummary', system, prompt, fresh: opts.fresh, parse: extractJson, validate: validateSessionSummary,
  });
  return toOutcome(result, fallback);
}
