import type {
  CareerRole,
  GapAction,
  ReadinessBreakdownItem,
  RoadmapProgress,
  SkillGapAnalysis,
  SkillGapItem,
  SkillProfile,
  SkillStatus,
  StudentRecord,
} from '../types';
import { getPlaybook } from '../data/skills';
import { levelOf } from './skills';
import { projectSkills } from './skills';
import { round } from './util';

export const READINESS_WEIGHTS = { skills: 0.7, evidence: 0.2, progress: 0.1 } as const;

export function classify(coverage: number, core: boolean): SkillStatus {
  if (coverage >= 0.9) return 'strong';
  if (coverage < 0.35 || (core && coverage < 0.5)) return 'critical';
  return 'needs_improvement';
}

export function fillProject(text: string, student: StudentRecord): string {
  const project = student.projects[0]?.title;
  return text.replace(/\{project\}/g, project ? `“${project}”` : 'one of your projects');
}

export function gapActionFor(skill: string, student: StudentRecord): GapAction {
  const pb = getPlaybook(skill);
  if (!pb) {
    return { title: `Practise ${skill}`, how: `Build one small project that uses ${skill}.`, estimatedHours: 6 };
  }
  return {
    title: fillProject(pb.project.title, student),
    how: fillProject(pb.project.description, student),
    estimatedHours: pb.project.hours,
  };
}

/**
 * Deterministic skill-gap analysis + readiness score. The LLM never produces a score:
 *
 *   skills   (70%)  Σ weight × min(1, level / target) over the role's skills
 *   evidence (20%)  50% relevant projects (cap 2) · 20% certifications (cap 1) · 30% verified skills
 *   progress (10%)  hours-weighted roadmap completion
 */
export function analyzeSkillGap(
  role: CareerRole,
  skills: SkillProfile[],
  student: StudentRecord,
  progress: Pick<RoadmapProgress, 'overall'>,
  demand: Record<string, number> = {},
): SkillGapAnalysis {
  const totalWeight = role.skills.reduce((s, r) => s + r.weight, 0) || 1;

  const raw = role.skills.map(req => {
    const level = levelOf(skills, req.skill);
    const coverage = Math.min(1, level / req.target);
    const gap = Math.max(0, req.target - level);
    return { req, level, coverage, gap };
  });
  const totalWeightedGap = raw.reduce((s, r) => s + r.gap * r.req.weight, 0);

  const items: SkillGapItem[] = raw.map(({ req, level, coverage, gap }) => {
    const pb = getPlaybook(req.skill);
    const d = demand[req.skill] ?? 0;
    const why = pb?.why ?? `${req.skill} is a required skill for ${role.title}.`;
    return {
      skill: req.skill,
      level,
      target: req.target,
      gap,
      coverage,
      weight: req.weight / totalWeight,
      core: Boolean(req.core),
      status: classify(coverage, Boolean(req.core)),
      impact: totalWeightedGap > 0 ? (gap * req.weight) / totalWeightedGap : 0,
      whyItMatters: d > 0 ? `${why} It appears in ${d} of your matched opportunities on TRYBE.` : why,
      action: gapActionFor(req.skill, student),
    };
  });

  const skillScore = raw.reduce((s, r) => s + r.req.weight * r.coverage, 0) / totalWeight;

  const roleSkills = new Set(role.skills.map(r => r.skill));
  const relevantProjects = student.projects.filter(p => projectSkills(p).some(s => roleSkills.has(s))).length;
  const relevantCerts = student.career.certifications.filter(c => c.skills.some(s => roleSkills.has(s))).length;
  const verified = skills.filter(s => s.verified && roleSkills.has(s.name)).length;
  const evidenceScore =
    0.5 * Math.min(1, relevantProjects / 2) + 0.2 * Math.min(1, relevantCerts / 1) + 0.3 * (verified / role.skills.length);

  const atTarget = items.filter(i => i.coverage >= 1).length;
  const breakdown: ReadinessBreakdownItem[] = [
    {
      key: 'skills',
      label: 'Skill coverage',
      weightPct: round(READINESS_WEIGHTS.skills * 100),
      scorePct: round(skillScore * 100),
      detail: `${atTarget} of ${role.skills.length} required skills at target level`,
    },
    {
      key: 'evidence',
      label: 'Proof of work',
      weightPct: round(READINESS_WEIGHTS.evidence * 100),
      scorePct: round(evidenceScore * 100),
      detail: `${relevantProjects} relevant project${relevantProjects === 1 ? '' : 's'} · ${relevantCerts} certification${relevantCerts === 1 ? '' : 's'} · ${verified} verified skill${verified === 1 ? '' : 's'}`,
    },
    {
      key: 'progress',
      label: 'Roadmap progress',
      weightPct: round(READINESS_WEIGHTS.progress * 100),
      scorePct: round(progress.overall),
      detail: `${round(progress.overall)}% of planned learning hours completed`,
    },
  ];

  const readiness = round(
    READINESS_WEIGHTS.skills * skillScore * 100 +
      READINESS_WEIGHTS.evidence * evidenceScore * 100 +
      READINESS_WEIGHTS.progress * progress.overall,
  );

  const byImpact = (a: SkillGapItem, b: SkillGapItem) => b.impact - a.impact || b.weight - a.weight;
  return {
    roleId: role.id,
    roleTitle: role.title,
    readiness: Math.max(0, Math.min(100, readiness)),
    breakdown,
    items: [...items].sort(byImpact),
    strengths: items.filter(i => i.status === 'strong').sort((a, b) => b.level - a.level),
    needsImprovement: items.filter(i => i.status === 'needs_improvement').sort(byImpact),
    critical: items.filter(i => i.status === 'critical').sort(byImpact),
  };
}
