import type { CareerProfile, Opportunity, StudentRecord, StudentSnapshot } from '../types';
import { getRole } from '../data/roles';
import { canonicalSkill } from '../data/skills';
import type { RoadmapContext } from './roadmap';
import { computeProgress } from './roadmap';
import { analyzeSkillGap } from './gap';
import { latestAssessments, deriveSkills } from './skills';
import { rankOpportunities } from './opportunities';
import { computeNextActions, profileCompleteness } from './nextAction';
import type { CareerRole, SkillProfile } from '../types';

export const EMPTY_CAREER: CareerProfile = {
  targetRoles: [],
  targetIndustries: [],
  experienceLevel: 'Beginner',
  skillLevels: {},
  careerInterests: [],
  careerGoals: [],
  learningPreferences: { style: 'mixed', pace: 'steady' },
  weeklyLearningHours: 6,
  opportunityPreferences: { workMode: 'any' },
  certifications: [],
};

/** Merge a stored (possibly partial / older) career object over safe defaults. */
export function resolveCareer(stored: Partial<CareerProfile> | undefined, fallback: CareerProfile): CareerProfile {
  const base = stored ?? fallback;
  const list = <T,>(v: unknown, d: T[]): T[] => (Array.isArray(v) ? (v as T[]) : d);
  const hours = Number(base.weeklyLearningHours);
  return {
    ...EMPTY_CAREER,
    ...base,
    targetRoles: list(base.targetRoles, []),
    targetIndustries: list(base.targetIndustries, []),
    careerInterests: list(base.careerInterests, []),
    careerGoals: list(base.careerGoals, []),
    certifications: list(base.certifications, []),
    skillLevels: base.skillLevels && typeof base.skillLevels === 'object' ? base.skillLevels : {},
    weeklyLearningHours: Number.isFinite(hours) && hours > 0 ? Math.min(40, hours) : EMPTY_CAREER.weeklyLearningHours,
    learningPreferences: { ...EMPTY_CAREER.learningPreferences, ...(base.learningPreferences ?? {}) },
    opportunityPreferences: { ...EMPTY_CAREER.opportunityPreferences, ...(base.opportunityPreferences ?? {}) },
  };
}

export function buildRoadmapContext(
  student: StudentRecord,
  role: CareerRole,
  skills: SkillProfile[],
  now: string,
): RoadmapContext {
  const entryLevels: Record<string, number> = {};
  for (const s of skills) entryLevels[s.name] = s.entryLevel;
  const verified: Record<string, number> = {};
  for (const [skill, a] of Object.entries(latestAssessments(student.assessments))) verified[skill] = a.score;
  return {
    student,
    role,
    entryLevels,
    verified,
    weeklyHours: student.career.weeklyLearningHours,
    now,
  };
}

/** Everything the five career features need, derived from one student record. */
export function buildSnapshot(student: StudentRecord, opportunities: Opportunity[], now: string): StudentSnapshot {
  const role = getRole(student.career.targetRoles[0]);
  const skills = deriveSkills(student, student.roadmap);
  const progress = computeProgress(student.roadmap, now);
  const completeness = profileCompleteness(student);

  let analysis = role ? analyzeSkillGap(role, skills, student, progress) : null;
  const gapSkills = new Set((analysis?.items ?? []).filter(i => i.status !== 'strong').map(i => i.skill));
  const scored = rankOpportunities(opportunities, { student, skills, role, gapSkills, now });

  // Which skills do the student's matched opportunities keep asking for?
  if (role && analysis) {
    const demand: Record<string, number> = {};
    for (const o of scored) {
      if (o.expired || o.score < 50) continue;
      for (const s of [...o.opportunity.requiredSkills, ...o.opportunity.preferredSkills]) {
        const c = canonicalSkill(s) ?? s;
        demand[c] = (demand[c] ?? 0) + 1;
      }
    }
    analysis = analyzeSkillGap(role, skills, student, progress, demand);
  }

  const actions = computeNextActions({
    student, role, skills, analysis, progress, roadmap: student.roadmap, opportunities: scored, completeness, now,
  });

  return {
    student,
    role,
    skills,
    analysis,
    progress,
    opportunities: scored,
    nextBestAction: actions[0],
    alternatives: actions.slice(1, 6),
    completeness,
    now,
  };
}
