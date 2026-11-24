import type { ScoredOpportunity, StudentSnapshot } from '../career/types';
import { requestAiJson, toOutcome, type AiOutcome } from './aiService';
import { opportunityPrompt } from './prompts';
import { extractJson, validateOpportunityExplanation } from './validators';

export function explainOpportunityLocally(scored: ScoredOpportunity): string {
  const missing = scored.missing.length ? ` To strengthen your application, build ${scored.missing.slice(0, 2).join(' and ')}.` : '';
  return `${scored.reasons.join(' ') || 'This opportunity broadly fits your profile.'}${missing}`;
}

/** The match score is computed by the engine. AI only explains it in plain language. */
export async function explainOpportunityMatch(
  snap: StudentSnapshot,
  scored: ScoredOpportunity,
  opts: { fresh?: boolean } = {},
): Promise<AiOutcome<string>> {
  const { system, prompt } = opportunityPrompt(snap, scored);
  const result = await requestAiJson({
    task: 'opportunity', system, prompt, fresh: opts.fresh, parse: extractJson, validate: validateOpportunityExplanation,
  });
  return toOutcome(result, explainOpportunityLocally(scored));
}
