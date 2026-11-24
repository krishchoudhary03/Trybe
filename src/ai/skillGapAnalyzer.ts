import type { StudentSnapshot } from '../career/types';
import { requestAiJson, toOutcome, type AiOutcome } from './aiService';
import { skillGapPrompt } from './prompts';
import { extractJson, validateSkillGapExplanation, type SkillGapAiExplanation } from './validators';

/** Deterministic explanation of the score — used as fallback and as the baseline for AI. */
export function explainSkillGapLocally(snap: StudentSnapshot): SkillGapAiExplanation | null {
  const a = snap.analysis;
  if (!a || !snap.role) return null;
  const [skills, evidence, progress] = a.breakdown;
  const summary =
    `Your readiness for ${a.roleTitle} is ${a.readiness}%: ${skills.scorePct}% skill coverage (70% of the score), ` +
    `${evidence.scorePct}% proof of work (20%) and ${progress.scorePct}% roadmap progress (10%).`;
  return {
    summary,
    strengths: a.strengths.slice(0, 3).map(s => `${s.skill} is at ${s.level}/${s.target}.`),
    gaps: [...a.critical, ...a.needsImprovement].slice(0, 3).map(g => `${g.skill} is ${g.gap} points below target (${g.level}/${g.target}). ${g.whyItMatters}`),
    recommendations: a.items.filter(i => i.gap > 0).slice(0, 3).map(i => `${i.action.title} (about ${i.action.estimatedHours} hours).`),
  };
}

export async function explainSkillGap(
  snap: StudentSnapshot,
  opts: { fresh?: boolean } = {},
): Promise<AiOutcome<SkillGapAiExplanation> | null> {
  const fallback = explainSkillGapLocally(snap);
  if (!fallback) return null;
  const { system, prompt } = skillGapPrompt(snap);
  const result = await requestAiJson({
    task: 'skillGap', system, prompt, fresh: opts.fresh, parse: extractJson, validate: validateSkillGapExplanation,
  });
  return toOutcome(result, fallback);
}
