import type {
  AssessmentResult,
  CareerProfile,
  Roadmap,
  SkillProfile,
  StudentProject,
  StudentRecord,
} from '../types';
import { canonicalSkill, getPlaybook } from '../data/skills';
import { clamp, round } from './util';

/** Canonical skills evidenced by a project's technologies / skills fields. */
export function projectSkills(p: Pick<StudentProject, 'technologies' | 'skills'>): string[] {
  const out = new Set<string>();
  for (const raw of [...p.technologies, ...p.skills]) {
    const c = canonicalSkill(raw);
    if (c) out.add(c);
  }
  return Array.from(out);
}

export function latestAssessments(assessments: AssessmentResult[]): Record<string, AssessmentResult> {
  const latest: Record<string, AssessmentResult> = {};
  for (const a of assessments) {
    const cur = latest[a.skill];
    if (!cur || new Date(a.takenAt).getTime() >= new Date(cur.takenAt).getTime()) latest[a.skill] = a;
  }
  return latest;
}

/** Sum of skill gains from completed roadmap tasks, per skill. */
export function roadmapGains(roadmap: Roadmap | null): Record<string, { gain: number; count: number }> {
  const out: Record<string, { gain: number; count: number }> = {};
  if (!roadmap) return out;
  for (const phase of roadmap.phases) {
    for (const task of phase.tasks) {
      if (task.status !== 'completed' || !task.skill) continue;
      const cur = out[task.skill] ?? { gain: 0, count: 0 };
      cur.gain += task.skillGain;
      cur.count += 1;
      out[task.skill] = cur;
    }
  }
  return out;
}

interface Candidate {
  name: string;
  claimed: boolean;
  rated?: number;
  implied?: number;
  projects: string[];
  certs: string[];
  evidence: string[];
}

/**
 * Derive an evidence-backed level per skill from data TRYBE already stores:
 * profile skills, self-ratings, own projects, certifications, assessments and
 * completed roadmap tasks. Every number is explainable via `evidence`.
 *
 *   entryBase  = (self-rating | 40 if listed | 25 if only seen in a project)
 *              + 5 per own project using the skill (max 15) + 10 per certification (max 10)
 *   evidence   = entryBase + gains from completed roadmap tasks
 *   level      = assessment ? 0.8 × latest score + 0.2 × evidence : evidence
 */
export function deriveSkills(student: StudentRecord, roadmap: Roadmap | null = student.roadmap): SkillProfile[] {
  const career: CareerProfile = student.career;
  const cands = new Map<string, Candidate>();
  const get = (name: string): Candidate => {
    let c = cands.get(name);
    if (!c) {
      c = { name, claimed: false, projects: [], certs: [], evidence: [] };
      cands.set(name, c);
    }
    return c;
  };

  for (const raw of student.skills) {
    const name = canonicalSkill(raw);
    if (!name) continue;
    const c = get(name);
    if (!c.claimed) c.evidence.push('Listed on your TRYBE profile');
    c.claimed = true;
  }
  for (const [name, rating] of Object.entries(career.skillLevels)) {
    const canon = canonicalSkill(name) ?? name;
    if (!getPlaybook(canon)) continue;
    const c = get(canon);
    c.rated = Math.max(c.rated ?? 0, clamp(rating));
    c.claimed = true;
  }
  for (const p of student.projects) {
    for (const s of projectSkills(p)) {
      const c = get(s);
      if (!c.projects.includes(p.title)) {
        c.projects.push(p.title);
        c.evidence.push(`Used in project “${p.title}”`);
      }
    }
  }
  for (const cert of career.certifications) {
    for (const raw of cert.skills) {
      const name = canonicalSkill(raw) ?? (getPlaybook(raw) ? raw : null);
      if (!name) continue;
      const c = get(name);
      c.certs.push(cert.name);
      c.evidence.push(`Certification: ${cert.name}`);
    }
  }

  // Implied skills (e.g. React → JavaScript) — only where nothing stronger exists.
  const direct = new Map(cands);
  for (const [name, c] of direct) {
    const pb = getPlaybook(name);
    if (!pb?.implies) continue;
    const base = baseLevel(c);
    for (const [target, factor] of Object.entries(pb.implies)) {
      const t = get(target);
      const implied = round(base * factor);
      if (!t.claimed && t.projects.length === 0 && t.certs.length === 0) {
        if ((t.implied ?? 0) < implied) {
          t.implied = implied;
          t.evidence = t.evidence.filter(e => !e.startsWith('Implied by'));
          t.evidence.push(`Implied by your ${name} experience`);
        }
      }
    }
  }

  const gains = roadmapGains(roadmap);
  for (const skill of Object.keys(gains)) get(skill);

  // An assessment is evidence even for a skill the student never listed on their profile.
  const assessed = latestAssessments(student.assessments);
  for (const skill of Object.keys(assessed)) get(skill);
  const result: SkillProfile[] = [];

  for (const c of cands.values()) {
    const entryBase = clamp(baseLevel(c) + Math.min(15, c.projects.length * 5) + Math.min(10, c.certs.length * 10));
    const gain = gains[c.name];
    const a = assessed[c.name];
    const evidenceLevel = clamp(entryBase + (gain?.gain ?? 0));
    const entryLevel = a ? round(0.8 * a.score + 0.2 * entryBase) : round(entryBase);
    const level = a ? round(0.8 * a.score + 0.2 * evidenceLevel) : round(evidenceLevel);
    const evidence = [...c.evidence];
    if (c.rated !== undefined) evidence.push(`Self-rated ${c.rated}/100`);
    if (gain && gain.count > 0) evidence.push(`Completed ${gain.count} roadmap task${gain.count > 1 ? 's' : ''} (+${round(gain.gain)})`);
    if (a) evidence.push(`Latest assessment: ${a.score}%`);
    result.push({
      name: c.name,
      level,
      entryLevel,
      evidence,
      verified: Boolean(a),
      claimed: c.claimed,
      latestAssessment: a?.score,
    });
  }

  return result.sort((x, y) => y.level - x.level || x.name.localeCompare(y.name));
}

function baseLevel(c: Candidate): number {
  if (c.rated !== undefined) return c.rated;
  if (c.claimed) return 40;
  if (c.implied !== undefined && c.projects.length === 0 && c.certs.length === 0) return c.implied;
  if (c.projects.length > 0 || c.certs.length > 0) return 25;
  if (c.implied !== undefined) return c.implied;
  return 0;
}

export function levelOf(skills: SkillProfile[], name: string): number {
  return skills.find(s => s.name === name)?.level ?? 0;
}

export function entryLevelOf(skills: SkillProfile[], name: string): number {
  return skills.find(s => s.name === name)?.entryLevel ?? 0;
}
