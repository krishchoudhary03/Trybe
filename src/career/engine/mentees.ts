import type { MentorSession, Opportunity, StudentRecord } from '../types';
import { MENTEE_SEEDS, type MenteeSeed } from '../data/mentees';
import { getRole } from '../data/roles';
import { DAY_MS, addDays } from './util';
import { adaptRoadmapForAssessment, buildRoadmap, setTaskDone, WEAK_SCORE } from './roadmap';
import { buildRoadmapContext, resolveCareer, EMPTY_CAREER } from './snapshot';
import { deriveSkills } from './skills';

export const MENTOR_ID = 'mentor-desk';

export function buildMenteeRecord(seed: MenteeSeed, opps: Opportunity[], nowIso: string): StudentRecord {
  const now = new Date(nowIso);
  const ago = (days: number) => new Date(now.getTime() - days * DAY_MS).toISOString();
  const career = resolveCareer({ ...EMPTY_CAREER, ...seed.career }, EMPTY_CAREER);

  const sessions: MentorSession[] = seed.sessions.map((s, i) => ({
    id: `${seed.id}-session-${i}`,
    studentId: seed.id,
    mentorId: MENTOR_ID,
    date: ago(s.daysAgo),
    notes: s.notes,
    actionItems: s.actionItems.map((a, j) => ({ id: `${seed.id}-ai-${i}-${j}`, title: a.title, done: a.done })),
  }));

  const opportunityStatus: StudentRecord['opportunityStatus'] = {};
  for (const id of seed.applied) if (opps.some(o => o.id === id)) opportunityStatus[id] = 'applied';

  const student: StudentRecord = {
    id: seed.id,
    name: seed.name,
    college: seed.college,
    skills: seed.skills,
    interests: seed.interests,
    location: seed.location,
    projects: seed.projects,
    career,
    assessments: seed.assessments.map((a, i) => ({
      id: `${seed.id}-as-${i}`, skill: a.skill, score: a.score, takenAt: ago(a.daysAgo), source: 'manual' as const,
    })),
    roadmap: null,
    opportunityStatus,
    sessions,
  };

  const role = getRole(career.targetRoles[0]);
  if (!role) return student;

  // Plan from the day the roadmap was generated, complete work in order, then adapt to assessments.
  const generatedAt = ago(seed.generatedDaysAgo);
  const skills = deriveSkills(student, null);
  let roadmap = buildRoadmap(buildRoadmapContext(student, role, skills, generatedAt), null);

  let hours = 0;
  const order = roadmap.phases.flatMap(p => p.tasks).filter(t => t.status === 'todo' && t.tier !== 'assessment');
  const step = seed.generatedDaysAgo / Math.max(1, order.length);
  order.forEach((t, i) => {
    if (hours >= seed.completedHours) return;
    hours += t.estimatedHours;
    roadmap = setTaskDone(roadmap, t.id, true, addDays(generatedAt, Math.round(step * (i + 1))), career.weeklyLearningHours);
  });

  for (const a of student.assessments.filter(x => x.score < WEAK_SCORE)) {
    roadmap = adaptRoadmapForAssessment(roadmap, a, a.takenAt, career.weeklyLearningHours);
  }

  const withRoadmap: StudentRecord = { ...student, roadmap };
  // Final pass at "now" so entry levels include assessments and phases are consistent.
  const refreshed = buildRoadmap(
    buildRoadmapContext(withRoadmap, role, deriveSkills(withRoadmap, roadmap), nowIso),
    roadmap,
  );
  return { ...withRoadmap, roadmap: refreshed };
}

export function buildMenteeRecords(opps: Opportunity[], nowIso: string): StudentRecord[] {
  return MENTEE_SEEDS.map(seed => buildMenteeRecord(seed, opps, nowIso));
}
