/**
 * Verifies the deterministic career engine and the AI output guards.
 * Run with:  npm run verify:career
 */
import assert from 'node:assert/strict';
import type { Opportunity, StudentRecord } from '../src/career/types';
import { DEFAULT_CAREER_PROFILE } from '../src/career/data/defaults';
import { buildSampleOpportunities } from '../src/career/data/opportunities';
import { CAREER_ROLES, getRole } from '../src/career/data/roles';
import { SKILL_PLAYBOOKS } from '../src/career/data/skills';
import { buildSnapshot, buildRoadmapContext, EMPTY_CAREER } from '../src/career/engine/snapshot';
import { deriveSkills } from '../src/career/engine/skills';
import {
  adaptRoadmapForAssessment, buildRoadmap, computeProgress, promoteGapAction, isGapActionAdded,
  rebalanceSchedule, setTaskDone, phaseProgress,
} from '../src/career/engine/roadmap';
import { MATCH_WEIGHTS, projectToOpportunity } from '../src/career/engine/opportunities';
import { answerLocally, SUGGESTED_QUESTIONS } from '../src/career/engine/copilotLocal';
import { buildMentorInsights, buildSessionPlan, fallbackSessionSummary } from '../src/career/engine/mentor';
import { buildMenteeRecords } from '../src/career/engine/mentees';
import { INITIAL_PROJECTS } from '../src/data/projects';
import {
  validateCopilot, validateMentorInsights, validateSessionSummary, validateRoadmapNotes,
  validateOpportunityExplanation, extractJson, cleanText,
} from '../src/ai/validators';
import { DAY_MS } from '../src/career/engine/util';

let passed = 0;
const test = (name: string, fn: () => void) => {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n    ${(e as Error).message}`); process.exitCode = 1; }
};

const NOW = new Date('2026-09-01T10:00:00.000Z');
const nowIso = NOW.toISOString();
const opps: Opportunity[] = buildSampleOpportunities(NOW);

function kavya(over: Partial<StudentRecord> = {}): StudentRecord {
  const own = INITIAL_PROJECTS.filter(p => p.isOwn);
  return {
    id: 'kavya', name: 'Kavya Rajput', college: 'GLA University',
    skills: ['React', 'Figma', 'UI/UX', 'TypeScript'], interests: ['Design', 'AI', 'Startups', 'Open Source'],
    location: 'Mathura, India',
    projects: own.map(p => ({ id: p.id, title: p.title, technologies: p.technologies, skills: p.skills })),
    career: { ...DEFAULT_CAREER_PROFILE }, assessments: [], roadmap: null, opportunityStatus: {}, sessions: [],
    ...over,
  };
}

/** Student with a roadmap generated from their current data. */
function withRoadmap(s: StudentRecord, roleId?: string): StudentRecord {
  const career = roleId ? { ...s.career, targetRoles: [roleId] } : s.career;
  const st = { ...s, career };
  const role = getRole(career.targetRoles[0])!;
  const roadmap = buildRoadmap(buildRoadmapContext(st, role, deriveSkills(st, null), nowIso), st.roadmap);
  return { ...st, roadmap };
}

console.log('\nData integrity');
test('every role skill has a playbook and weights are positive', () => {
  const names = new Set(SKILL_PLAYBOOKS.map(p => p.skill));
  for (const r of CAREER_ROLES) {
    assert.ok(r.skills.length >= 5, r.id);
    for (const s of r.skills) { assert.ok(names.has(s.skill), `${r.id}: ${s.skill}`); assert.ok(s.weight > 0 && s.target > 0 && s.target <= 100); }
    const phaseSkills = r.phases.flatMap(p => p.skills).sort();
    assert.deepEqual(phaseSkills, r.skills.map(s => s.skill).sort(), `${r.id} phases must cover every skill exactly once`);
  }
});
test('match weights sum to 1', () => {
  assert.equal(Math.round(Object.values(MATCH_WEIGHTS).reduce((a, b) => a + b, 0) * 1000) / 1000, 1);
});

console.log('\nSkill levels & readiness');
test('skills derive from profile + projects with evidence (no duplicate "studentSkills")', () => {
  const skills = deriveSkills(kavya());
  const react = skills.find(s => s.name === 'React')!;
  assert.ok(react.level >= 72 && react.claimed);
  assert.ok(react.evidence.some(e => e.includes('project')));
  const python = skills.find(s => s.name === 'Python')!;
  assert.ok(python && !python.claimed, 'Python is inferred from the AI Chatbot project');
  assert.ok(skills.find(s => s.name === 'JavaScript')!.evidence.some(e => e.startsWith('Implied')));
  assert.equal(skills.find(s => s.name === 'UI/UX Design')!.claimed, true, 'Figma + UI/UX collapse to one skill');
});
test('an assessment counts even for a skill the student never listed (regression)', () => {
  const st = kavya({ assessments: [{ id: 'a1', skill: 'Statistics', score: 41, takenAt: nowIso, source: 'manual' }] });
  const stat = deriveSkills(st).find(s => s.name === 'Statistics')!;
  assert.ok(stat, 'Statistics must appear');
  assert.equal(stat.verified, true);
  assert.equal(stat.level, Math.round(0.8 * 41));
  assert.equal(stat.latestAssessment, 41);
});
test('readiness is deterministic and bounded', () => {
  const a = buildSnapshot(withRoadmap(kavya()), opps, nowIso).analysis!;
  const b = buildSnapshot(withRoadmap(kavya()), opps, nowIso).analysis!;
  assert.equal(a.readiness, b.readiness);
  assert.ok(a.readiness > 0 && a.readiness < 100);
  assert.equal(a.breakdown.length, 3);
  assert.equal(a.breakdown.reduce((s, x) => s + x.weightPct, 0), 100);
});
test('more skills → higher readiness; classification is consistent', () => {
  const base = buildSnapshot(withRoadmap(kavya()), opps, nowIso).analysis!;
  const better = buildSnapshot(withRoadmap(kavya({ career: { ...DEFAULT_CAREER_PROFILE, skillLevels: { ...DEFAULT_CAREER_PROFILE.skillLevels, 'Node.js': 80, SQL: 70, Git: 70 } }, skills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Git'] })), opps, nowIso).analysis!;
  assert.ok(better.readiness > base.readiness, `${better.readiness} > ${base.readiness}`);
  for (const i of base.items) {
    if (i.status === 'strong') assert.ok(i.coverage >= 0.9);
    if (i.status === 'critical') assert.ok(i.coverage < 0.5);
    assert.ok(i.action.title.length > 0 && i.action.estimatedHours > 0);
  }
  const impactSum = base.items.reduce((s, i) => s + i.impact, 0);
  assert.ok(Math.abs(impactSum - 1) < 1e-6);
});
test('gap action mentions the student’s own project', () => {
  const a = buildSnapshot(withRoadmap(kavya(), 'backend-developer'), opps, nowIso).analysis!;
  const docker = a.items.find(i => i.skill === 'Docker')!;
  assert.match(docker.action.title, /Containerize “Campus App Re-design”|Containerize “AI Chatbot/);
});

console.log('\nAdaptive roadmap');
test('roadmap generated from target role; skills influence it', () => {
  const s = withRoadmap(kavya());
  const flat = s.roadmap!.phases.flatMap(p => p.tasks);
  assert.equal(s.roadmap!.roleId, 'full-stack-developer');
  const react = flat.filter(t => t.skill === 'React');
  assert.ok(react.some(t => t.status === 'skipped'), 'foundation skipped — React is strong');
  const node = flat.filter(t => t.skill === 'Node.js');
  assert.ok(node.every(t => t.status === 'todo'), 'Node.js is a real gap');
});
test('a proficient skill is not repeated (Python 95% assessment)', () => {
  const ai = { ...kavya(), skills: ['Python'], career: { ...DEFAULT_CAREER_PROFILE, targetRoles: ['ai-engineer'], skillLevels: { Python: 50 } } };
  const before = withRoadmap(ai);
  const pyBefore = before.roadmap!.phases[0].tasks.filter(t => t.skill === 'Python' && t.status === 'todo');
  assert.ok(pyBefore.length >= 3);
  const withScore = withRoadmap({ ...before, assessments: [{ id: 'a1', skill: 'Python', score: 95, takenAt: nowIso, source: 'manual' }] });
  const pyAfter = withScore.roadmap!.phases[0].tasks.filter(t => t.skill === 'Python');
  assert.ok(pyAfter.every(t => t.status === 'skipped'), 'all Python tasks skipped after 95%');
  assert.match(pyAfter[0].note!, /95%/);
});
test('weak assessment (ML = 42%) inserts review → practice → retake before the project', () => {
  let s = withRoadmap({ ...kavya(), skills: ['Python', 'Machine Learning'], career: { ...DEFAULT_CAREER_PROFILE, targetRoles: ['ai-engineer'], skillLevels: { Python: 80, 'Machine Learning': 45 } } });
  const a = { id: 'a-ml', skill: 'Machine Learning', score: 42, takenAt: nowIso, source: 'roadmap' as const };
  s = { ...s, assessments: [a], roadmap: adaptRoadmapForAssessment(s.roadmap!, a, nowIso, 8) };
  const role = getRole('ai-engineer')!;
  s = { ...s, roadmap: buildRoadmap(buildRoadmapContext(s, role, deriveSkills(s, s.roadmap), nowIso), s.roadmap) }; // reconcile keeps adaptive tasks
  const phase = s.roadmap!.phases.find(p => p.skills.includes('Machine Learning'))!;
  const tiers = phase.tasks.map(t => t.tier);
  const iReview = tiers.indexOf('review'), iPractice = tiers.indexOf('practice'), iRetake = tiers.indexOf('retake'), iProject = tiers.indexOf('project');
  assert.ok(iReview > -1 && iReview < iPractice && iPractice < iRetake && iRetake < iProject, tiers.join(','));
  assert.match(phase.tasks[iReview].title, /Gradient descent/i);
  assert.ok(phase.adaptiveNote && /42%/.test(phase.adaptiveNote));
  assert.ok(s.roadmap!.adaptations.some(e => e.kind === 'weak_assessment'));
  const snap = buildSnapshot(s, opps, nowIso);
  assert.equal(snap.nextBestAction.source, 'assessment', 'next-best-action surfaces the review');
  // passing the retake closes things out
  const retake = { id: 'a-ml2', skill: 'Machine Learning', score: 74, takenAt: nowIso, source: 'roadmap' as const };
  const after = adaptRoadmapForAssessment(s.roadmap!, retake, nowIso, 8);
  const open = after.phases.flatMap(p => p.tasks).filter(t => t.origin === 'adaptive' && t.status === 'todo');
  assert.equal(open.length, 0);
});
test('completing tasks raises progress and skill level; progress is hours-weighted', () => {
  let s = withRoadmap(kavya());
  const p0 = computeProgress(s.roadmap, nowIso).overall;
  const lvl0 = deriveSkills(s, s.roadmap).find(x => x.name === 'Node.js')?.level ?? 0;
  const task = s.roadmap!.phases.flatMap(p => p.tasks).find(t => t.skill === 'Node.js' && t.status === 'todo')!;
  s = { ...s, roadmap: setTaskDone(s.roadmap!, task.id, true, nowIso, 8) };
  assert.ok(computeProgress(s.roadmap, nowIso).overall > p0);
  assert.ok((deriveSkills(s, s.roadmap).find(x => x.name === 'Node.js')?.level ?? 0) > lvl0);
  const ph = s.roadmap!.phases.find(p => p.skills.includes('Node.js'))!;
  assert.ok(phaseProgress(ph) > 0 && phaseProgress(ph) < 100);
  s = { ...s, roadmap: setTaskDone(s.roadmap!, task.id, false, nowIso, 8) };
  assert.equal(computeProgress(s.roadmap, nowIso).overall, p0);
});
test('finishing every task for a skill closes (about) its planning-time gap', () => {
  let s = withRoadmap(kavya());
  const role = getRole('full-stack-developer')!;
  const target = role.skills.find(r => r.skill === 'SQL')!.target;
  const entry = deriveSkills(s, s.roadmap).find(x => x.name === 'SQL')?.entryLevel ?? 0;
  for (const t of s.roadmap!.phases.flatMap(p => p.tasks).filter(t => t.skill === 'SQL' && t.status === 'todo')) s = { ...s, roadmap: setTaskDone(s.roadmap!, t.id, true, nowIso, 8) };
  const level = deriveSkills(s, s.roadmap).find(x => x.name === 'SQL')!.level;
  assert.ok(Math.abs(level - target) <= 3 && entry < target, `level ${level} target ${target}`);
});
test('changing target role keeps completed work and skips skills already held', () => {
  let s = withRoadmap(kavya());
  const t = s.roadmap!.phases.flatMap(p => p.tasks).find(x => x.skill === 'Git' && x.status === 'todo')!;
  s = { ...s, roadmap: setTaskDone(s.roadmap!, t.id, true, nowIso, 8) };
  const switched = withRoadmap(s, 'frontend-developer');
  assert.equal(switched.roadmap!.roleId, 'frontend-developer');
  assert.equal(switched.roadmap!.id !== s.roadmap!.id, true);
  assert.ok(switched.roadmap!.phases.flatMap(p => p.tasks).find(x => x.id === t.id)?.status === 'completed');
  assert.ok(switched.roadmap!.adaptations.some(e => e.kind === 'role_changed'));
});
test('reconcile is idempotent (returns the same object when nothing changed)', () => {
  const s = withRoadmap(kavya());
  const again = buildRoadmap(buildRoadmapContext(s, getRole('full-stack-developer')!, deriveSkills(s, s.roadmap), nowIso), s.roadmap);
  assert.equal(again, s.roadmap);
});
test('gap action → roadmap promotes the existing project task without duplicating', () => {
  const s = withRoadmap(kavya());
  const { roadmap, added } = promoteGapAction(s.roadmap!, 'SQL', s, nowIso, 8);
  assert.ok(added && isGapActionAdded(roadmap, 'SQL'));
  assert.equal(roadmap.phases.flatMap(p => p.tasks).filter(t => t.skill === 'SQL' && t.tier === 'project').length, 1);
  const again = promoteGapAction(roadmap, 'SQL', s, nowIso, 8);
  assert.equal(again.added, false);
  // survives a reconcile with no duplicate
  const st = { ...s, roadmap };
  const re = buildRoadmap(buildRoadmapContext(st, getRole('full-stack-developer')!, deriveSkills(st, roadmap), nowIso), roadmap);
  assert.equal(re.phases.flatMap(p => p.tasks).filter(t => t.skill === 'SQL' && t.tier === 'project').length, 1);
});
test('missed tasks are detected and rebalancing re-schedules them', () => {
  const s = withRoadmap(kavya());
  const later = new Date(NOW.getTime() + 40 * DAY_MS).toISOString();
  const p = computeProgress(s.roadmap, later);
  assert.ok(p.overdueTasks.length >= 2 && p.behind);
  const snap = buildSnapshot(s, opps, later);
  assert.equal(snap.nextBestAction.source, 'roadmap');
  const rb = rebalanceSchedule(s.roadmap!, later, 8);
  assert.equal(computeProgress(rb, later).overdueTasks.length, 0);
});

console.log('\nOpportunity matching');
test('scores are computed (not hard-coded), skills + career goal move them', () => {
  const full = buildSnapshot(withRoadmap(kavya()), opps, nowIso);
  const fs = full.opportunities.find(o => o.opportunity.id === 'opp-nimbus-fullstack-intern')!;
  const ml = full.opportunities.find(o => o.opportunity.id === 'opp-verta-ml-intern')!;
  assert.ok(fs.score > ml.score, `${fs.score} > ${ml.score}`);
  assert.ok(ml.missing.includes('Machine Learning'));
  const aiSnap = buildSnapshot(withRoadmap(kavya(), 'ai-engineer'), opps, nowIso);
  const ml2 = aiSnap.opportunities.find(o => o.opportunity.id === 'opp-verta-ml-intern')!;
  assert.ok(ml2.components.career > ml.components.career, 'career goal influences score');
  const stronger = buildSnapshot(withRoadmap(kavya({ skills: ['React', 'JavaScript', 'Node.js'], career: { ...DEFAULT_CAREER_PROFILE, skillLevels: { React: 72, JavaScript: 70, 'Node.js': 70 } } })), opps, nowIso);
  assert.ok(stronger.opportunities.find(o => o.opportunity.id === 'opp-nimbus-fullstack-intern')!.score > fs.score);
  for (const o of full.opportunities) assert.ok(o.score >= 0 && o.score <= 100);
});
test('results are sorted, expired items are flagged, and only real opportunity ids appear', () => {
  const old: Opportunity = { ...opps[0], id: 'old', deadline: new Date(NOW.getTime() - 3 * DAY_MS).toISOString() };
  const snap = buildSnapshot(withRoadmap(kavya()), [...opps, old], nowIso);
  assert.equal(snap.opportunities.length, opps.length + 1);
  assert.ok(snap.opportunities.find(o => o.opportunity.id === 'old')!.expired);
  const scores = snap.opportunities.map(o => o.score);
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
});
test('existing Work projects are reused as "project" opportunities', () => {
  const p = INITIAL_PROJECTS.find(x => !x.isOwn)!;
  const o = projectToOpportunity(p);
  assert.equal(o.type, 'project'); assert.equal(o.internalPath, '/work'); assert.equal(o.id, `work:${p.id}`);
});
test('remote-only preference demotes onsite roles', () => {
  const a = buildSnapshot(withRoadmap(kavya()), opps, nowIso).opportunities.find(o => o.opportunity.id === 'opp-pixelcraft-frontend-intern')!;
  const b = buildSnapshot(withRoadmap(kavya({ career: { ...DEFAULT_CAREER_PROFILE, opportunityPreferences: { workMode: 'remote' } } })), opps, nowIso).opportunities.find(o => o.opportunity.id === 'opp-pixelcraft-frontend-intern')!;
  assert.ok(b.components.location < a.components.location);
});

console.log('\nNext-best-action');
test('no role → complete-profile action; no crash on empty profile', () => {
  const empty = kavya({ skills: [], projects: [], career: { ...EMPTY_CAREER } });
  const snap = buildSnapshot(empty, opps, nowIso);
  assert.equal(snap.nextBestAction.kind, 'update_profile');
  assert.equal(snap.analysis, null);
  assert.equal(snap.completeness.complete, false);
  assert.ok(answerLocally('what should I learn?', snap).answer.includes('incomplete'));
  assert.ok(buildMentorInsights(snap).concerns.length > 0);
});
test('every action has what / why / how / time and a valid target', () => {
  const snap = buildSnapshot(withRoadmap(kavya()), opps, nowIso);
  for (const a of [snap.nextBestAction, ...snap.alternatives]) {
    assert.ok(a.title && a.reason && a.how && a.estimatedHours > 0 && ['high', 'medium', 'low'].includes(a.impact));
  }
  const scores = [snap.nextBestAction, ...snap.alternatives].map(a => a.priorityScore);
  assert.deepEqual(scores, [...scores].sort((x, y) => y - x));
});
test('a closing high-match opportunity can become the next best action', () => {
  const soon = opps.map(o => o.id === 'opp-nimbus-fullstack-intern' ? { ...o, deadline: new Date(NOW.getTime() + 2 * DAY_MS).toISOString() } : o);
  const snap = buildSnapshot(withRoadmap(kavya({ skills: ['React', 'JavaScript', 'Node.js'], career: { ...DEFAULT_CAREER_PROFILE, skillLevels: { React: 75, JavaScript: 70, 'Node.js': 60 } } })), soon, nowIso);
  assert.equal(snap.nextBestAction.source, 'opportunity');
  assert.deepEqual(snap.nextBestAction.target, { type: 'opportunity', id: 'opp-nimbus-fullstack-intern' });
});

console.log('\nCopilot (rules-based)');
test('every suggested question returns a valid structured response grounded in real data', () => {
  const snap = buildSnapshot(withRoadmap(kavya()), opps, nowIso);
  const ids = new Set(opps.map(o => o.id));
  for (const q of [...SUGGESTED_QUESTIONS, 'How can I improve my chances as a Backend Developer?', 'asdf']) {
    const r = answerLocally(q, snap);
    assert.ok(r.answer.length > 20, q);
    assert.ok(['high', 'medium', 'low'].includes(r.priority), q);
    for (const id of r.opportunityIds ?? []) assert.ok(ids.has(id), `${q}: unknown opportunity ${id}`);
  }
});

console.log('\nMentor');
test('mentor insights are derived from data and plan/summaries are well-formed', () => {
  const mentees = buildMenteeRecords(opps, nowIso);
  assert.equal(mentees.length, 3);
  const rahul = buildSnapshot(mentees[0], opps, nowIso);
  assert.equal(rahul.role!.id, 'ai-engineer');
  const ins = buildMentorInsights(rahul);
  assert.ok(ins.strengths.length > 0 && ins.concerns.length > 0 && ins.discussionTopics.length >= 3 && ins.actionItems.length > 0);
  assert.ok(ins.concerns.some(c => /deployment/i.test(c)), ins.concerns.join('|'));
  assert.ok(ins.concerns.some(c => /No applications/i.test(c)));
  const plan = buildSessionPlan(ins);
  assert.ok(plan.agenda.reduce((s, a) => s + a.minutes, 0) <= 50 && plan.goals.length > 0);
  const sum = fallbackSessionSummary(rahul, ins, 'Went through the ML project.\n- Deploy it with Docker\n- Apply to 3 internships\nShould revisit overfitting.');
  assert.deepEqual(sum.actionItems, ['Deploy it with Docker', 'Apply to 3 internships', 'Should revisit overfitting.']);
});
test('demo mentees differ meaningfully (behind pace / weak assessment / strong)', () => {
  const [rahul, ananya, dev] = buildMenteeRecords(opps, nowIso).map(m => buildSnapshot(m, opps, nowIso));
  assert.ok(ananya.analysis!.readiness > rahul.analysis!.readiness && rahul.analysis!.readiness > dev.analysis!.readiness,
    `${ananya.analysis!.readiness} > ${rahul.analysis!.readiness} > ${dev.analysis!.readiness}`);
  assert.ok(dev.progress.behind);
  assert.ok(dev.skills.find(x => x.name === 'Statistics')?.latestAssessment === 41, 'Statistics assessment is counted');
  assert.ok(buildMentorInsights(dev).concerns.some(c => /Weak assessment result in Statistics \(41%\)/.test(c)), buildMentorInsights(dev).concerns.join('|'));
  assert.ok(dev.student.roadmap!.phases.flatMap(p => p.tasks).some(t => t.tier === 'review'), 'weak Statistics assessment adapted his roadmap');
  console.log(`      readiness  Ananya ${ananya.analysis!.readiness}%  Rahul ${rahul.analysis!.readiness}%  Dev ${dev.analysis!.readiness}%`);
  console.log(`      progress   Ananya ${ananya.progress.overall}%  Rahul ${rahul.progress.overall}%  Dev ${dev.progress.overall}%`);
});

console.log('\nAI output guards');
test('extractJson handles fences / prose and rejects garbage', () => {
  assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(extractJson('Sure! Here you go: {"a":1} hope that helps'), { a: 1 });
  assert.equal(extractJson('not json'), null);
});
test('copilot validator clamps, strips URLs and drops unknown opportunity ids', () => {
  const valid = new Set(['opp-a']);
  const r = validateCopilot({ answer: 'Apply at https://evil.example now', priority: 'urgent', skill: 'Docker', estimatedHours: 9999, opportunityIds: ['opp-a', 'google-ai-internship-2026'] }, { opportunityIds: valid, skills: new Set(['Docker']) })!;
  assert.ok(!/https?:/.test(r.answer));
  assert.equal(r.priority, 'medium');
  assert.ok(r.estimatedHours! <= 200);
  assert.deepEqual(r.opportunityIds, ['opp-a']);
  assert.equal(validateCopilot({ answer: '' }, { opportunityIds: valid, skills: new Set() }), null);
  assert.equal(validateCopilot('nope', { opportunityIds: valid, skills: new Set() }), null);
  assert.equal(validateCopilot({ answer: 'ok', skill: 'Underwater basket weaving' }, { opportunityIds: valid, skills: new Set(['Docker']) })!.skill, undefined);
});
test('mentor / session / roadmap / opportunity validators', () => {
  assert.equal(validateMentorInsights({ summary: 'x' }), null);
  const m = validateMentorInsights({ summary: 'S', strengths: ['a'], concerns: ['b'], discussionTopics: ['c'], actionItems: ['d'] })!;
  assert.deepEqual(m.actionItems, ['d']);
  assert.equal(validateSessionSummary({ summary: 'S', strengths: [], concerns: [], actionItems: ['x'], nextSessionGoals: [] })!.actionItems[0], 'x');
  assert.deepEqual(validateRoadmapNotes({ phases: [{ id: 'p1', note: 'hi' }, { id: 'bogus', note: 'x' }] }, new Set(['p1'])), { p1: 'hi' });
  assert.equal(validateOpportunityExplanation({ explanation: 'See https://x.y for more' })!.includes('http'), false);
  assert.equal(cleanText('  **Hi**  there\n\n\n', 50), 'Hi there');
});

console.log(`\n${passed} checks passed${process.exitCode ? ' — WITH FAILURES' : ''}\n`);
