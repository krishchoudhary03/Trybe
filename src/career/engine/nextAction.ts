import type {
  CareerRole,
  NextBestAction,
  OpportunityType,
  Priority,
  ProfileCompleteness,
  Roadmap,
  RoadmapProgress,
  ScoredOpportunity,
  SkillGapAnalysis,
  SkillProfile,
  StudentRecord,
} from '../types';
import { canonicalSkill } from '../data/skills';
import { gapActionFor } from './gap';
import { openTasks } from './roadmap';
import { daysBetween, round } from './util';

export interface NextActionInput {
  student: StudentRecord;
  role: CareerRole | null;
  skills: SkillProfile[];
  analysis: SkillGapAnalysis | null;
  progress: RoadmapProgress;
  roadmap: Roadmap | null;
  opportunities: ScoredOpportunity[];
  completeness: ProfileCompleteness;
  now: string;
}

const APPLY_HOURS: Record<OpportunityType, number> = {
  internship: 2, job: 2, hackathon: 1, certification: 1, competition: 1, project: 1, research: 2,
};

export function impactFor(score: number): Priority {
  return score >= 85 ? 'high' : score >= 60 ? 'medium' : 'low';
}

export function profileCompleteness(student: StudentRecord): ProfileCompleteness {
  const missing: string[] = [];
  if (student.career.targetRoles.length === 0) missing.push('a target role');
  const hasSkills =
    student.skills.some(s => canonicalSkill(s)) || Object.keys(student.career.skillLevels).length > 0;
  if (!hasSkills) missing.push('skills');
  return { complete: missing.length === 0, missing };
}

/**
 * Single source of truth for "what should this student do next?". Candidates come from
 * every part of the career layer, are scored on urgency × impact, and sorted. Career Copilot,
 * Home, Roadmap, Opportunities and the Mentor view all read from this list.
 */
/*
 * Priority scale (higher wins):
 *   92–99  overdue roadmap task            84–94  application closing in ≤ 3 days
 *   91     review after a weak assessment  48–89  largest skill gaps (impact-weighted)
 *   62–72  application closing in ≤ 14 days   78  no projects yet
 *   60     next roadmap task               55     mentor check-in      45  verify a skill
 */
export function computeNextActions(input: NextActionInput): NextBestAction[] {
  const { student, role, analysis, progress, roadmap, opportunities, completeness, now } = input;
  const out: NextBestAction[] = [];
  const push = (a: Omit<NextBestAction, 'impact'>) => out.push({ ...a, impact: impactFor(a.priorityScore) });

  if (!completeness.complete || !role || !analysis) {
    push({
      id: 'profile:complete',
      title: 'Complete your career profile',
      reason: `Add ${completeness.missing.join(' and ') || 'a target role'} to unlock your readiness score, roadmap and opportunity matches.`,
      how: 'Choose a target role and rate the skills you already have.',
      estimatedHours: 0.25,
      source: 'profile',
      kind: 'update_profile',
      ctaLabel: 'Complete Career Profile',
      target: { type: 'profile' },
      priorityScore: 100,
    });
    return out;
  }

  const open = openTasks(roadmap);

  // 1 ─ overdue roadmap work
  const overdue = progress.overdueTasks
    .map(t => ({ t, days: t.dueAt ? daysBetween(t.dueAt, now) : 0 }))
    .sort((a, b) => b.days - a.days)[0];
  if (overdue) {
    push({
      id: `task:${overdue.t.id}`,
      title: overdue.t.title,
      reason: `This task was due ${overdue.days} day${overdue.days === 1 ? '' : 's'} ago. Finishing it keeps your ${role.title} roadmap on track.`,
      how: overdue.t.description,
      estimatedHours: overdue.t.estimatedHours,
      relatedSkill: overdue.t.skill || undefined,
      source: 'roadmap',
      kind: 'complete_task',
      ctaLabel: 'Open roadmap',
      target: { type: 'task', taskId: overdue.t.id },
      priorityScore: 92 + Math.min(7, overdue.days),
    });
  }

  // 2 ─ adaptive review after a weak assessment
  const review = open.find(o => o.task.origin === 'adaptive' && (o.task.tier === 'review' || o.task.tier === 'practice'));
  if (review) {
    push({
      id: `task:${review.task.id}`,
      title: review.task.title,
      reason: `${review.task.note ?? 'A recent assessment showed gaps.'} Fixing this now prevents trouble in later phases.`,
      how: review.task.description,
      estimatedHours: review.task.estimatedHours,
      relatedSkill: review.task.skill,
      source: 'assessment',
      kind: 'improve_weak_skill',
      ctaLabel: 'Open roadmap',
      target: { type: 'task', taskId: review.task.id },
      priorityScore: 91,
    });
  }

  // 3 ─ closing opportunities the student can realistically win
  for (const o of opportunities) {
    if (o.expired || o.score < 65 || o.daysLeft === undefined || o.daysLeft > 14) continue;
    if (['applied', 'dismissed'].includes(student.opportunityStatus[o.opportunity.id])) continue;
    const t = o.opportunity.type;
    const haveReq = o.skillDetails.filter(d => d.required && d.state === 'have').length;
    const req = o.skillDetails.filter(d => d.required).length;
    push({
      id: `opp:${o.opportunity.id}`,
      title: `${t === 'hackathon' ? 'Join' : 'Apply to'} ${o.opportunity.title}`,
      reason: `${o.score}% match that closes in ${o.daysLeft} day${o.daysLeft === 1 ? '' : 's'}${req ? ` — you meet ${haveReq} of ${req} required skills` : ''}.`,
      how: `Review the requirements, prepare a short pitch and submit before the deadline.${o.missing.length ? ` Be ready to discuss ${o.missing[0]}.` : ''}`,
      estimatedHours: APPLY_HOURS[t],
      source: 'opportunity',
      kind: t === 'hackathon' ? 'join_hackathon' : 'apply',
      ctaLabel: 'View opportunity',
      target: { type: 'opportunity', id: o.opportunity.id },
      priorityScore: (o.daysLeft <= 3 ? 84 : 62) + Math.round(o.score / 10),
    });
  }

  // 4 ─ biggest gaps → the next roadmap task for that skill (or a concrete project)
  const topGaps = analysis.items.filter(i => i.gap > 0).slice(0, 3);
  const maxImpact = topGaps[0]?.impact || 1;
  topGaps.forEach(g => {
    const next = open.find(o => o.task.skill === g.skill && o.task.tier !== 'assessment') ?? open.find(o => o.task.skill === g.skill);
    const score = 48 + Math.round(37 * Math.min(1, g.impact / Math.max(0.01, maxImpact))) + (g.status === 'critical' ? 4 : 0);
    const share = round(g.impact * 100);
    const reason = `${g.skill} is ${g.status === 'critical' ? 'a critical gap' : 'below target'} for ${role.title} (${g.level}/${g.target}) and accounts for ${share}% of your remaining skill gap.`;
    if (next) {
      push({
        id: `gap:${g.skill}:${next.task.id}`,
        title: next.task.title,
        reason,
        how: next.task.description,
        estimatedHours: next.task.estimatedHours,
        relatedSkill: g.skill,
        source: 'skill_gap',
        kind: next.task.tier === 'project' ? 'build_project' : 'learn_skill',
        ctaLabel: 'Start action',
        target: { type: 'task', taskId: next.task.id },
        priorityScore: score,
      });
    } else {
      const a = gapActionFor(g.skill, student);
      push({
        id: `gap:${g.skill}`,
        title: a.title,
        reason,
        how: a.how,
        estimatedHours: a.estimatedHours,
        relatedSkill: g.skill,
        source: 'skill_gap',
        kind: 'build_project',
        ctaLabel: 'Add to roadmap',
        target: { type: 'route', to: '/career/readiness' },
        priorityScore: score,
      });
    }
  });

  // 5 ─ no projects yet
  if (student.projects.length === 0) {
    push({
      id: 'project:first',
      title: 'Add your first project',
      reason: 'You have no projects yet. Proof of work is 20% of your readiness score and what recruiters check first.',
      how: 'Create a project in Work (even a small one) and tag the technologies you used.',
      estimatedHours: 6,
      source: 'project',
      kind: 'build_project',
      ctaLabel: 'Go to Work',
      target: { type: 'route', to: '/work' },
      priorityScore: 78,
    });
  }

  // 6 ─ next task in the roadmap
  const nextTask = open.find(o => o.task.tier !== 'assessment') ?? open[0];
  if (nextTask) {
    push({
      id: `task:${nextTask.task.id}`,
      title: nextTask.task.title,
      reason: `Next step in “${nextTask.phase.title}” on your ${role.title} roadmap.`,
      how: nextTask.task.description,
      estimatedHours: nextTask.task.estimatedHours,
      relatedSkill: nextTask.task.skill || undefined,
      source: 'roadmap',
      kind: 'complete_task',
      ctaLabel: 'Open roadmap',
      target: { type: 'task', taskId: nextTask.task.id },
      priorityScore: 60,
    });
  }

  // 7 ─ verify a self-rated core skill
  const unverified = analysis.items.find(i => i.core && i.level >= 30 && !input.skills.find(s => s.name === i.skill)?.verified);
  if (unverified) {
    push({
      id: `assess:${unverified.skill}`,
      title: `Verify your ${unverified.skill} level`,
      reason: `${unverified.skill} is a core skill for ${role.title} but your level is self-reported. A quick skill check makes your roadmap and readiness more accurate.`,
      how: `Take a practice test or timed exercise and log the score.`,
      estimatedHours: 1,
      relatedSkill: unverified.skill,
      source: 'assessment',
      kind: 'take_assessment',
      ctaLabel: 'Log a skill check',
      target: { type: 'assess', skill: unverified.skill },
      priorityScore: 45,
    });
  }

  // 8 ─ mentor check-in
  const last = student.sessions.map(s => s.date).sort().pop();
  const stale = !last || daysBetween(last, now) > 30;
  if (stale && progress.completedTasks > 0) {
    push({
      id: 'mentor:meet',
      title: 'Schedule a mentor check-in',
      reason: last ? `It's been ${daysBetween(last, now)} days since your last mentor session.` : "You haven't had a mentor session yet.",
      how: 'Share your roadmap and top skill gap with your mentor and agree on two action items.',
      estimatedHours: 1,
      source: 'mentor',
      kind: 'meet_mentor',
      ctaLabel: 'Open Mentor Desk',
      target: { type: 'route', to: '/career/mentor' },
      priorityScore: 55,
    });
  }

  // de-duplicate by id, highest score first (stable order for ties)
  const seen = new Set<string>();
  return out
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .filter(a => (seen.has(a.id) ? false : (seen.add(a.id), true)));
}
