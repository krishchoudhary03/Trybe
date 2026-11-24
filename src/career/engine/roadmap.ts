import type {
  AdaptationEvent,
  AssessmentResult,
  CareerRole,
  PhaseStatus,
  Roadmap,
  RoadmapPhase,
  RoadmapProgress,
  RoadmapTask,
  StudentRecord,
} from '../types';
import { getPlaybook, skillSlug } from '../data/skills';
import { fillProject } from './gap';
import { DAY_MS, daysBetween, round, uid } from './util';

export const ACTION_PHASE_ID = 'actions';
export const WEAK_SCORE = 60;
export const STRONG_SCORE = 85;

export interface RoadmapContext {
  student: StudentRecord;
  role: CareerRole;
  /** skill → entry level (profile + projects + certs + assessments, excluding roadmap gains) */
  entryLevels: Record<string, number>;
  /** skill → latest assessment score */
  verified: Record<string, number>;
  weeklyHours: number;
  now: string;
}

// ─────────────────────────────────────────
// Template generation
// ─────────────────────────────────────────

function buildTemplatePhases(ctx: RoadmapContext): RoadmapPhase[] {
  const { role, student } = ctx;

  return role.phases.map((def, idx) => {
    const tasks: RoadmapTask[] = [];

    for (const skill of def.skills) {
      const pb = getPlaybook(skill);
      if (!pb) continue;
      const target = role.skills.find(r => r.skill === skill)?.target ?? 60;
      const entry = ctx.entryLevels[skill] ?? 0;
      const coverage = entry / target;
      const gap = Math.max(0, target - entry);
      const slug = skillSlug(skill);
      const assessed = ctx.verified[skill];
      const skipNote =
        assessed !== undefined
          ? `Skipped — your ${skill} assessment (${assessed}%) already covers this.`
          : `Skipped — your current ${skill} level (${round(entry)}) already covers this.`;

      const spec = [
        ...pb.foundation.map(tpl => ({ tier: 'foundation' as const, tpl })),
        ...pb.core.map(tpl => ({ tier: 'core' as const, tpl })),
        { tier: 'project' as const, tpl: pb.project },
      ];
      const skipFor = (tier: 'foundation' | 'core' | 'project') =>
        coverage >= 1 || (tier === 'foundation' && coverage >= 0.5) || (tier === 'core' && coverage >= 0.9);
      const learnHours = spec.filter(s => !skipFor(s.tier)).reduce((sum, s) => sum + s.tpl.hours, 0);

      for (const { tier, tpl } of spec) {
        const skipped = skipFor(tier);
        tasks.push({
          id: `${slug}:${tier}:${tpl.key}`,
          title: fillProject(tpl.title, student),
          description: fillProject(tpl.description, student),
          skill,
          tier,
          estimatedHours: tpl.hours,
          status: skipped ? 'skipped' : 'todo',
          // finishing every planned task closes the gap that existed at planning time
          skillGain: skipped || learnHours === 0 ? 0 : round((gap * tpl.hours) / learnHours),
          origin: 'template',
          note: skipped ? skipNote : undefined,
        });
      }

      const skipAssessment = coverage >= 1;
      tasks.push({
        id: `${slug}:assessment`,
        title: `Skill check: ${skill}`,
        description: `Take a practice test or timed exercise for ${skill} and log your score. Below ${WEAK_SCORE}% adds targeted review tasks; ${STRONG_SCORE}%+ lets you skip ahead.`,
        skill,
        tier: 'assessment',
        estimatedHours: 1,
        status: skipAssessment ? 'skipped' : 'todo',
        skillGain: 0,
        origin: 'template',
        note: skipAssessment ? skipNote : undefined,
      });
    }

    return {
      id: `${role.id}:${idx + 1}`,
      title: def.title,
      description: def.description,
      skills: def.skills,
      tasks,
      estimatedHours: 0,
      status: 'upcoming' as PhaseStatus,
    };
  });
}

// ─────────────────────────────────────────
// Normalisation: scheduling + derived phase fields
// ─────────────────────────────────────────

function scheduleOpenTasks(phases: RoadmapPhase[], now: string, weeklyHours: number): RoadmapPhase[] {
  const perWeek = Math.max(1, weeklyHours);
  let cursor = new Date(now).getTime();
  for (const p of phases) {
    for (const t of p.tasks) {
      if (t.status === 'todo' && t.dueAt) cursor = Math.max(cursor, new Date(t.dueAt).getTime());
    }
  }
  return phases.map(p => ({
    ...p,
    tasks: p.tasks.map(t => {
      if (t.status !== 'todo' || t.dueAt) return t;
      const days = Math.max(1, Math.ceil((t.estimatedHours / perWeek) * 7));
      cursor += days * DAY_MS;
      return { ...t, dueAt: new Date(cursor).toISOString() };
    }),
  }));
}

function taskStatusOnly(tasks: RoadmapTask[]): { active: RoadmapTask[]; done: number } {
  const active = tasks.filter(t => t.status !== 'skipped');
  return { active, done: active.filter(t => t.status === 'completed').length };
}

export function normalizeRoadmap(roadmap: Roadmap, now: string, weeklyHours: number): Roadmap {
  const scheduled = scheduleOpenTasks(roadmap.phases, now, weeklyHours);
  let currentAssigned = false;
  const phases = scheduled.map(p => {
    const { active, done } = taskStatusOnly(p.tasks);
    let status: PhaseStatus;
    if (active.length === 0) status = 'proficient';
    else if (done === active.length) status = 'completed';
    else if (p.id === ACTION_PHASE_ID) status = done > 0 ? 'in_progress' : 'upcoming';
    else if (done > 0) {
      status = 'in_progress';
      currentAssigned = true;
    } else if (!currentAssigned) {
      status = 'in_progress';
      currentAssigned = true;
    } else status = 'upcoming';
    return {
      ...p,
      status,
      estimatedHours: active.reduce((s, t) => s + t.estimatedHours, 0),
    };
  });
  return { ...roadmap, phases };
}

// ─────────────────────────────────────────
// Generate / reconcile
// ─────────────────────────────────────────

function structureKey(r: Roadmap): string {
  return JSON.stringify({ roleId: r.roleId, phases: r.phases, adaptations: r.adaptations.length });
}

/**
 * Build (or rebuild) the roadmap for the student's target role. Completed work, adaptive
 * review tasks and action-plan tasks from `prev` are preserved, so re-running this after a
 * skill/project/assessment change re-plans only what is still outstanding.
 */
export function buildRoadmap(ctx: RoadmapContext, prev: Roadmap | null): Roadmap {
  const fresh = buildTemplatePhases(ctx);
  const sameRole = Boolean(prev && prev.roleId === ctx.role.id);
  const prevTasks = new Map<string, RoadmapTask>();
  prev?.phases.forEach(p => p.tasks.forEach(t => prevTasks.set(t.id, t)));

  const actionTasks = prev?.phases.find(p => p.id === ACTION_PHASE_ID)?.tasks ?? [];
  const actionIds = new Set(actionTasks.map(t => t.id));
  const roleSkills = new Set(ctx.role.skills.map(s => s.skill));
  const adaptiveTasks = (prev?.phases ?? [])
    .filter(p => p.id !== ACTION_PHASE_ID)
    .flatMap(p => p.tasks)
    .filter(t => t.origin === 'adaptive' && roleSkills.has(t.skill));
  const prevNotes = new Map((prev?.phases ?? []).map(p => [p.id, p.adaptiveNote]));

  const phases: RoadmapPhase[] = fresh.map(phase => {
    let tasks = phase.tasks
      .filter(t => !actionIds.has(t.id))
      .map(t => {
        const old = prevTasks.get(t.id);
        if (!old) return t;
        if (old.status === 'completed') {
          return { ...t, status: 'completed' as const, completedAt: old.completedAt, skillGain: old.skillGain, note: old.note, dueAt: old.dueAt };
        }
        if (t.status === 'todo' && old.dueAt) return { ...t, dueAt: old.dueAt };
        return t;
      });

    for (const a of adaptiveTasks) {
      if (!phase.skills.includes(a.skill) || tasks.some(t => t.id === a.id)) continue;
      const at = tasks.findIndex(t => t.skill === a.skill && t.tier === 'project');
      if (at === -1) tasks = [...tasks, a];
      else tasks = [...tasks.slice(0, at), a, ...tasks.slice(at)];
    }

    return { ...phase, tasks, adaptiveNote: sameRole ? prevNotes.get(phase.id) : undefined };
  });

  if (actionTasks.length > 0) {
    phases.push({
      id: ACTION_PHASE_ID,
      title: 'Action Plan',
      description: 'Tasks you added from skill-gap recommendations, mentor sessions and Copilot.',
      skills: [],
      tasks: actionTasks,
      estimatedHours: 0,
      status: 'upcoming',
    });
  }

  const adaptations: AdaptationEvent[] = [...(prev?.adaptations ?? [])];
  if (prev && !sameRole) {
    adaptations.push({
      id: uid('ev'),
      at: ctx.now,
      kind: 'role_changed',
      message: `Target role changed to ${ctx.role.title}. Completed work was carried over and skills you already have were skipped.`,
    });
  }

  const roadmap = normalizeRoadmap(
    {
      id: sameRole && prev ? prev.id : uid('roadmap'),
      studentId: ctx.student.id,
      roleId: ctx.role.id,
      targetRole: ctx.role.title,
      phases,
      generatedAt: sameRole && prev ? prev.generatedAt : ctx.now,
      updatedAt: ctx.now,
      adaptations: adaptations.slice(-30),
    },
    ctx.now,
    ctx.weeklyHours,
  );

  if (prev && sameRole && structureKey(prev) === structureKey(roadmap)) return prev;
  return roadmap;
}

// ─────────────────────────────────────────
// Task mutations (pure)
// ─────────────────────────────────────────

function mapTasks(roadmap: Roadmap, fn: (t: RoadmapTask) => RoadmapTask): Roadmap {
  return { ...roadmap, phases: roadmap.phases.map(p => ({ ...p, tasks: p.tasks.map(fn) })) };
}

export function findTask(roadmap: Roadmap | null, taskId: string): RoadmapTask | undefined {
  return roadmap?.phases.flatMap(p => p.tasks).find(t => t.id === taskId);
}

export function setTaskDone(roadmap: Roadmap, taskId: string, done: boolean, now: string, weeklyHours: number): Roadmap {
  const next = mapTasks(roadmap, t =>
    t.id !== taskId
      ? t
      : done
        ? { ...t, status: 'completed', completedAt: now }
        : { ...t, status: 'todo', completedAt: undefined },
  );
  return normalizeRoadmap({ ...next, updatedAt: now }, now, weeklyHours);
}

function ensureActionPhase(roadmap: Roadmap): Roadmap {
  if (roadmap.phases.some(p => p.id === ACTION_PHASE_ID)) return roadmap;
  return {
    ...roadmap,
    phases: [
      ...roadmap.phases,
      {
        id: ACTION_PHASE_ID,
        title: 'Action Plan',
        description: 'Tasks you added from skill-gap recommendations, mentor sessions and Copilot.',
        skills: [],
        tasks: [],
        estimatedHours: 0,
        status: 'upcoming',
      },
    ],
  };
}

export interface ActionTaskInput {
  id?: string;
  title: string;
  description: string;
  skill?: string;
  estimatedHours: number;
  origin: 'gap' | 'mentor' | 'copilot' | 'opportunity';
  note?: string;
}

export function addActionTask(roadmap: Roadmap, input: ActionTaskInput, now: string, weeklyHours: number): Roadmap {
  const withPhase = ensureActionPhase(roadmap);
  const id = input.id ?? uid('action');
  const exists = withPhase.phases.some(p => p.tasks.some(t => t.id === id));
  if (exists) return roadmap;
  const task: RoadmapTask = {
    id,
    title: input.title,
    description: input.description,
    skill: input.skill ?? '',
    tier: 'action',
    estimatedHours: input.estimatedHours,
    status: 'todo',
    skillGain: input.skill ? 8 : 0,
    origin: input.origin,
    note: input.note,
  };
  const phases = withPhase.phases.map(p => (p.id === ACTION_PHASE_ID ? { ...p, tasks: [...p.tasks, task] } : p));
  return normalizeRoadmap({ ...withPhase, phases, updatedAt: now }, now, weeklyHours);
}

export function isGapActionAdded(roadmap: Roadmap | null, skill: string): boolean {
  const phase = roadmap?.phases.find(p => p.id === ACTION_PHASE_ID);
  return Boolean(phase?.tasks.some(t => t.skill === skill && t.origin === 'gap'));
}

/**
 * "Add to roadmap" for a skill gap. If the roadmap already has an open project task for that
 * skill it is promoted into the Action Plan (no duplicates); otherwise a task is created.
 */
export function promoteGapAction(
  roadmap: Roadmap,
  skill: string,
  student: StudentRecord,
  now: string,
  weeklyHours: number,
): { roadmap: Roadmap; added: boolean } {
  if (isGapActionAdded(roadmap, skill)) return { roadmap, added: false };
  const withPhase = ensureActionPhase(roadmap);
  let promoted: RoadmapTask | undefined;
  const phases = withPhase.phases.map(p => {
    if (p.id === ACTION_PHASE_ID) return p;
    const idx = p.tasks.findIndex(t => t.skill === skill && t.tier === 'project' && t.status === 'todo');
    if (idx === -1 || promoted) return p;
    promoted = { ...p.tasks[idx], origin: 'gap', note: 'Prioritised from your skill-gap analysis.' };
    return { ...p, tasks: p.tasks.filter((_, i) => i !== idx) };
  });
  if (promoted) {
    const moved = promoted;
    const done = phases.map(p => (p.id === ACTION_PHASE_ID ? { ...p, tasks: [moved, ...p.tasks] } : p));
    return { roadmap: normalizeRoadmap({ ...withPhase, phases: done, updatedAt: now }, now, weeklyHours), added: true };
  }
  const pb = getPlaybook(skill);
  const next = addActionTask(
    withPhase,
    {
      id: `gap:${skillSlug(skill)}`,
      title: fillProject(pb?.project.title ?? `Practise ${skill}`, student),
      description: fillProject(pb?.project.description ?? `Build one small project that uses ${skill}.`, student),
      skill,
      estimatedHours: pb?.project.hours ?? 6,
      origin: 'gap',
      note: 'Added from your skill-gap analysis.',
    },
    now,
    weeklyHours,
  );
  return { roadmap: next, added: true };
}

export function rebalanceSchedule(roadmap: Roadmap, now: string, weeklyHours: number): Roadmap {
  const cleared = mapTasks(roadmap, t => (t.status === 'todo' ? { ...t, dueAt: undefined } : t));
  const next = normalizeRoadmap(cleared, now, weeklyHours);
  return {
    ...next,
    adaptations: [
      ...next.adaptations,
      {
        id: uid('ev'),
        at: now,
        kind: 'rebalanced' as const,
        message: `Schedule rebalanced around your ${weeklyHours} h/week learning time.`,
      },
    ].slice(-30),
  };
}

// ─────────────────────────────────────────
// Assessment-driven adaptation
// ─────────────────────────────────────────

/**
 * Weak result (< 60%): insert Review → Practice → Retake tasks inside the skill's phase, ahead
 * of the project. Passing result: close any open adaptive tasks for the skill.
 * (Skipping already-mastered content is handled by `buildRoadmap` from the new entry level.)
 */
export function adaptRoadmapForAssessment(
  roadmap: Roadmap,
  assessment: AssessmentResult,
  now: string,
  weeklyHours: number,
): Roadmap {
  const { skill, score } = assessment;
  const phase = roadmap.phases.find(p => p.id !== ACTION_PHASE_ID && p.skills.includes(skill));
  if (!phase) return roadmap;

  const events: AdaptationEvent[] = [];
  let phases = roadmap.phases;

  if (score < WEAK_SCORE) {
    const pb = getPlaybook(skill);
    const topics = pb?.review ?? [`${skill} fundamentals`];
    const base = `adapt:${skillSlug(skill)}:${assessment.id}`;
    const note = `Added after your ${skill} assessment (${score}%).`;
    const newTasks: RoadmapTask[] = [
      {
        id: `${base}:review`,
        title: `Review: ${topics.join(', ')}`,
        description: `Your ${skill} check scored ${score}%. Revisit these topics before moving on — they are the most common sources of lost marks.`,
        skill, tier: 'review', estimatedHours: 3, status: 'todo', skillGain: 4, origin: 'adaptive', note,
      },
      {
        id: `${base}:practice`,
        title: `Practice: ${skill} problem set`,
        description: `Solve 10 targeted problems on ${topics[0]} and ${topics[1] ?? topics[0]}, then explain each solution in writing.`,
        skill, tier: 'practice', estimatedHours: 4, status: 'todo', skillGain: 4, origin: 'adaptive', note,
      },
      {
        id: `${base}:retake`,
        title: `Retake ${skill} skill check`,
        description: `Re-test yourself once the review and practice are done to verify the improvement.`,
        skill, tier: 'retake', estimatedHours: 1, status: 'todo', skillGain: 0, origin: 'adaptive', note,
      },
    ];
    phases = phases.map(p => {
      if (p.id !== phase.id) return p;
      // drop earlier open adaptive tasks for the same skill — superseded by this cycle
      const kept = p.tasks.filter(t => !(t.origin === 'adaptive' && t.skill === skill && t.status === 'todo'));
      const at = kept.findIndex(t => t.skill === skill && t.tier === 'project');
      const tasks = at === -1 ? [...kept, ...newTasks] : [...kept.slice(0, at), ...newTasks, ...kept.slice(at)];
      return {
        ...p,
        tasks,
        adaptiveNote: `${skill} check: ${score}%. Review, practice and a retake were added before you continue.`,
      };
    });
    events.push({
      id: uid('ev'),
      at: now,
      kind: 'weak_assessment',
      skill,
      message: `${skill} assessment scored ${score}% — added review, practice and a retake before the next phase.`,
    });
  } else {
    let closed = 0;
    phases = phases.map(p => ({
      ...p,
      tasks: p.tasks.map(t => {
        if (t.origin === 'adaptive' && t.skill === skill && t.status === 'todo') {
          closed += 1;
          return { ...t, status: 'skipped' as const, note: `Skipped — latest ${skill} score is ${score}%.` };
        }
        return t;
      }),
      adaptiveNote: p.skills.includes(skill) ? undefined : p.adaptiveNote,
    }));
    if (score >= STRONG_SCORE) {
      events.push({
        id: uid('ev'),
        at: now,
        kind: 'strong_assessment',
        skill,
        message: `${skill} assessment scored ${score}% — beginner content was skipped to save you time.`,
      });
    } else if (closed > 0) {
      events.push({
        id: uid('ev'),
        at: now,
        kind: 'strong_assessment',
        skill,
        message: `${skill} improved to ${score}% — review tasks were closed.`,
      });
    }
  }

  return normalizeRoadmap(
    { ...roadmap, phases, updatedAt: now, adaptations: [...roadmap.adaptations, ...events].slice(-30) },
    now,
    weeklyHours,
  );
}

// ─────────────────────────────────────────
// Progress & helpers
// ─────────────────────────────────────────

export function phaseProgress(phase: RoadmapPhase): number {
  const active = phase.tasks.filter(t => t.status !== 'skipped');
  const total = active.reduce((s, t) => s + t.estimatedHours, 0);
  if (active.length === 0 || total === 0) return 100;
  const done = active.filter(t => t.status === 'completed').reduce((s, t) => s + t.estimatedHours, 0);
  return round((done / total) * 100);
}

export function computeProgress(roadmap: Roadmap | null, now: string): RoadmapProgress {
  if (!roadmap) {
    return { overall: 0, completedTasks: 0, activeTasks: 0, skippedTasks: 0, overdueTasks: [], behind: false };
  }
  const all = roadmap.phases.flatMap(p => p.tasks);
  const active = all.filter(t => t.status !== 'skipped');
  const total = active.reduce((s, t) => s + t.estimatedHours, 0);
  const done = active.filter(t => t.status === 'completed');
  const doneHours = done.reduce((s, t) => s + t.estimatedHours, 0);
  const overdue = active.filter(t => t.status === 'todo' && t.dueAt && daysBetween(t.dueAt, now) >= 1);
  return {
    overall: active.length === 0 || total === 0 ? 100 : round((doneHours / total) * 100),
    completedTasks: done.length,
    activeTasks: active.length,
    skippedTasks: all.length - active.length,
    overdueTasks: overdue,
    behind: overdue.length >= 2,
  };
}

export function openTasks(roadmap: Roadmap | null): { task: RoadmapTask; phase: RoadmapPhase }[] {
  if (!roadmap) return [];
  const ordered = [...roadmap.phases].sort((a, b) =>
    a.id === ACTION_PHASE_ID ? -1 : b.id === ACTION_PHASE_ID ? 1 : 0,
  );
  return ordered.flatMap(phase => phase.tasks.filter(t => t.status === 'todo').map(task => ({ task, phase })));
}

/** Overdue work first, then upcoming tasks until the student's weekly hours are used up. */
export function weeklyPlan(roadmap: Roadmap | null, weeklyHours: number, now: string) {
  const open = openTasks(roadmap);
  const overdue = open.filter(o => o.task.dueAt && daysBetween(o.task.dueAt, now) >= 1);
  const rest = open.filter(o => !overdue.includes(o));
  const picked: typeof open = [];
  let hours = 0;
  for (const o of [...overdue, ...rest]) {
    if (picked.length > 0 && hours >= weeklyHours) break;
    picked.push(o);
    hours += o.task.estimatedHours;
  }
  return { items: picked, hours };
}

