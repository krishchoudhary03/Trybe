import type { CopilotMessage, CopilotResponse, StudentSnapshot } from '../career/types';
import { answerLocally } from '../career/engine/copilotLocal';
import { allCanonicalSkills } from '../career/data/skills';
import { requestAiJson, toOutcome, type AiOutcome } from './aiService';
import { copilotPrompt } from './prompts';
import { extractJson, validateCopilot } from './validators';

/** Answer a student question. Always resolves with a usable, grounded response. */
export async function generateCareerRecommendation(
  snap: StudentSnapshot,
  question: string,
  opts: { fresh?: boolean; thread?: CopilotMessage[] } = {},
): Promise<AiOutcome<CopilotResponse>> {
  const fallback = answerLocally(question, snap, opts.thread);
  const guards = {
    opportunityIds: new Set(snap.opportunities.map(o => o.opportunity.id)),
    skills: new Set([...allCanonicalSkills(), ...snap.skills.map(s => s.name)]),
  };
  const { system, prompt, messages } = copilotPrompt(snap, question, opts.thread);
  const result = await requestAiJson<CopilotResponse>({
    task: 'copilot',
    system,
    prompt,
    messages,
    fresh: opts.fresh || Boolean(messages && messages.length > 0),
    parse: extractJson,
    validate: raw => validateCopilot(raw, guards),
  });
  return toOutcome(result, fallback);
}
