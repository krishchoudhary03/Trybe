import type { CopilotMessage, Opportunity, ScoredOpportunity, StudentSnapshot } from '../career/types';
import { openTasks } from '../career/engine/roadmap';
import { phaseProgress } from '../career/engine/roadmap';

export const SYSTEM_PROMPT = `You are TRYBE Career Intelligence AI, the career guide inside the TRYBE student platform.

HARD RULES
- Use ONLY the data provided in the STUDENT CONTEXT. Do not invent student information.
- Never claim the student completed something unless it appears in the data.
- Never invent opportunities, internships, companies, deadlines, certifications, courses or URLs. You may only reference opportunities by the ids listed under OPPORTUNITIES. If none fit, say what kind of opportunity to look for instead.
- Scores (readiness, match %) are computed by TRYBE. Explain them; never change or recompute them.
- Be specific and actionable. For recommendations cover WHAT to do, WHY it matters for the target role, HOW to do it, and TIME needed.
- Plain text only inside JSON strings: no markdown, no links, no emojis.
- Respond with ONE JSON object that matches the requested schema exactly. No text outside the JSON.`;

const first = <T,>(arr: T[], n: number) => arr.slice(0, n);

function oppSummary(o: ScoredOpportunity) {
  return {
    id: o.opportunity.id,
    title: o.opportunity.title,
    organization: o.opportunity.organization,
    type: o.opportunity.type,
    matchScore: o.score,
    missingSkills: o.missing,
    daysLeft: o.daysLeft ?? null,
  };
}

/** Compact, structured student context shared by every prompt. */
export function buildContext(snap: StudentSnapshot): string {
  const { student, role, analysis, progress, roadmap = student.roadmap } = { ...snap, roadmap: snap.student.roadmap };
  const targets = new Map(role?.skills.map(s => [s.skill, s.target]));
  const open = openTasks(roadmap);
  const ctx = {
    student: {
      name: student.name.split(' ')[0],
      college: student.college,
      experienceLevel: student.career.experienceLevel,
      weeklyLearningHours: student.career.weeklyLearningHours,
      interests: student.interests,
      careerGoals: student.career.careerGoals.map(g => g.title),
      workMode: student.career.opportunityPreferences.workMode,
    },
    targetRole: role?.title ?? null,
    careerReadiness: analysis
      ? { score: analysis.readiness, breakdown: analysis.breakdown.map(b => ({ part: b.label, weightPct: b.weightPct, scorePct: b.scorePct })) }
      : null,
    skills: first(snap.skills, 14).map(s => ({
      name: s.name,
      level: s.level,
      target: targets.get(s.name) ?? null,
      verified: s.verified,
      evidence: first(s.evidence, 2),
    })),
    skillGaps: (analysis?.items ?? []).filter(i => i.gap > 0).slice(0, 6).map(i => ({
      skill: i.skill, level: i.level, target: i.target, status: i.status, shareOfGapPct: Math.round(i.impact * 100),
    })),
    projects: student.projects.map(p => ({ title: p.title, technologies: p.technologies })),
    certifications: student.career.certifications.map(c => c.name),
    assessments: snap.skills.filter(s => s.latestAssessment !== undefined).map(s => ({ skill: s.name, score: s.latestAssessment })),
    roadmap: roadmap
      ? {
          progressPct: progress.overall,
          behindSchedule: progress.behind,
          overdueTasks: progress.overdueTasks.length,
          phases: roadmap.phases.map(p => ({ id: p.id, title: p.title, status: p.status, progressPct: phaseProgress(p) })),
          upNext: first(open, 5).map(o => ({ title: o.task.title, skill: o.task.skill || null, hours: o.task.estimatedHours })),
          recentAdaptations: first([...roadmap.adaptations].reverse(), 3).map(a => a.message),
        }
      : null,
    opportunities: first(snap.opportunities.filter(o => !o.expired), 8).map(oppSummary),
    mentorSessions: first([...student.sessions].sort((a, b) => b.date.localeCompare(a.date)), 2).map(s => ({
      date: s.date.slice(0, 10),
      actionItems: s.actionItems.map(a => ({ title: a.title, done: a.done })),
    })),
    nextBestAction: { title: snap.nextBestAction.title, reason: snap.nextBestAction.reason, hours: snap.nextBestAction.estimatedHours },
  };
  return `STUDENT CONTEXT (JSON)\n${JSON.stringify(ctx)}`;
}

export interface PromptPair {
  system: string;
  prompt: string;
  messages?: { role: 'user' | 'assistant'; content: string }[];
}

export function copilotPrompt(snap: StudentSnapshot, question: string, thread?: CopilotMessage[]): PromptPair {
  const recentThread = (thread || []).slice(-6);
  const history = recentThread
    .map(m => `${m.role === 'user' ? 'Student' : 'Copilot'}: ${m.text}`)
    .join('\n');

  const messages: { role: 'user' | 'assistant'; content: string }[] = recentThread.map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));

  return {
    system: SYSTEM_PROMPT,
    messages,
    prompt: `${buildContext(snap)}
${history ? `\nRECENT CONVERSATION:\n${history}\n` : ''}
TASK
Answer the student's question as their conversational Career Copilot:
- Maintain natural context. If the student asks for clarification ("what?", "why?"), explain the previous message/recommendation in practical detail.
- If the student says "no", "skip", or objects, acknowledge empathetically and offer alternative options.
- If greeting or casual chat, be warm and encouraging without forcing a heavy action card.
- Ground advice strictly in their verified data.

QUESTION
${JSON.stringify(question.slice(0, 400))}

SCHEMA
{"answer": string (conversational response, clear, insightful, max 120 words),
 "nextBestAction": string | null (one concrete action, or null if answering casual/clarification question),
 "reason": string | null (why, tied to their data),
 "priority": "high" | "medium" | "low",
 "skill": string | null (must be a name from skills or skillGaps),
 "estimatedHours": number | null,
 "opportunityIds": string[] (only ids from OPPORTUNITIES; [] if none apply)}`,
  };
}

export function skillGapPrompt(snap: StudentSnapshot): PromptPair {
  return {
    system: SYSTEM_PROMPT,
    prompt: `${buildContext(snap)}

TASK
TRYBE has already calculated the readiness score and skill gaps. Explain the score to the student and recommend actions. Do not change any numbers.

SCHEMA
{"summary": string (max 70 words explaining why the score is what it is),
 "strengths": string[] (max 3, each one short sentence using their data),
 "gaps": string[] (max 3, each says which skill, how far from target and why it matters for the role),
 "recommendations": string[] (max 3, each a concrete action with the time it needs)}`,
  };
}

export function roadmapPrompt(snap: StudentSnapshot): PromptPair {
  return {
    system: SYSTEM_PROMPT,
    prompt: `${buildContext(snap)}

TASK
The roadmap structure is fixed by TRYBE. Write one short personalised coaching note for each phase (why this phase matters for this student, and one tip). Do not add, remove or rename phases or tasks.

SCHEMA
{"phases": [{"id": string (copied from roadmap.phases), "note": string (max 30 words)}]}`,
  };
}

export function opportunityPrompt(snap: StudentSnapshot, scored: ScoredOpportunity): PromptPair {
  const o: Opportunity = scored.opportunity;
  return {
    system: SYSTEM_PROMPT,
    prompt: `${buildContext(snap)}

OPPORTUNITY (real listing from TRYBE)
${JSON.stringify({
      id: o.id, title: o.title, organization: o.organization, type: o.type, requiredSkills: o.requiredSkills,
      preferredSkills: o.preferredSkills, experienceLevel: o.experienceLevel, remote: o.remote, daysLeft: scored.daysLeft ?? null,
      matchScore: scored.score, skillStates: scored.skillDetails.map(d => ({ skill: d.skill, required: d.required, state: d.state })),
    })}

TASK
Explain in plain language why this opportunity does or doesn't fit the student and what single step would most improve their chances. Reference only the facts above.

SCHEMA
{"explanation": string (max 80 words)}`,
  };
}

export function mentorPrompt(snap: StudentSnapshot, facts: { strengths: string[]; concerns: string[]; discussionTopics: string[] }): PromptPair {
  return {
    system: SYSTEM_PROMPT,
    prompt: `${buildContext(snap)}

FACTS ALREADY DERIVED BY TRYBE (you may rephrase and prioritise, but do not contradict)
${JSON.stringify(facts)}

TASK
Brief a mentor who is about to meet this student. Be concise and specific.

SCHEMA
{"summary": string (max 60 words),
 "strengths": string[] (max 4),
 "concerns": string[] (max 4),
 "discussionTopics": string[] (3-5, ordered by importance),
 "actionItems": string[] (3-4, each a concrete task the student can finish before the next session)}`,
  };
}

export function sessionSummaryPrompt(snap: StudentSnapshot, notes: string): PromptPair {
  return {
    system: SYSTEM_PROMPT,
    prompt: `${buildContext(snap)}

MENTOR SESSION NOTES (written by the mentor)
${JSON.stringify(notes.slice(0, 4000))}

TASK
Summarise the session. Action items must come from the notes (do not invent commitments the mentor did not mention). Strengths and concerns may also use the student context.

SCHEMA
{"summary": string (max 70 words),
 "strengths": string[] (max 3),
 "concerns": string[] (max 3),
 "actionItems": string[] (max 6, taken from the notes),
 "nextSessionGoals": string[] (max 3)}`,
  };
}
