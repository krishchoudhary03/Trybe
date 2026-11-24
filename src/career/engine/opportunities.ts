import type {
  CareerRole,
  ExperienceLevel,
  Opportunity,
  ScoredOpportunity,
  SkillMatchDetail,
  SkillProfile,
  StudentRecord,
} from '../types';
import type { Project } from '../../data/types';
import { canonicalSkill } from '../data/skills';
import { daysBetween, round } from './util';

/** Weights for the deterministic match score (sum to 1). */
export const MATCH_WEIGHTS = {
  skill: 0.4,
  career: 0.25,
  experience: 0.15,
  interest: 0.1,
  location: 0.05,
  deadline: 0.05,
} as const;

const BAR: Record<ExperienceLevel | 'Any', number> = { Beginner: 35, Intermediate: 50, Advanced: 65, Any: 40 };
const LEVEL_INDEX: Record<ExperienceLevel, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };

export interface MatchContext {
  student: StudentRecord;
  skills: SkillProfile[];
  role: CareerRole | null;
  /** Skills the student is currently weak at for their target role. */
  gapSkills: Set<string>;
  now: string;
}

/** Level for a skill name that may or may not be in the canonical library. */
function levelForName(name: string, skills: SkillProfile[], student: StudentRecord): number {
  const canon = canonicalSkill(name) ?? name;
  const known = skills.find(s => s.name === canon);
  if (known) return known.level;
  return student.skills.some(s => s.trim().toLowerCase() === name.trim().toLowerCase()) ? 40 : 0;
}

export function scoreOpportunity(opp: Opportunity, ctx: MatchContext): ScoredOpportunity {
  const { student, skills, role, now } = ctx;
  const bar = BAR[opp.experienceLevel];

  // ── Skill match (40%) ──
  const detail = (name: string, required: boolean): SkillMatchDetail => {
    const level = levelForName(name, skills, student);
    const state = level >= bar ? 'have' : level >= bar * 0.5 ? 'partial' : 'missing';
    return { skill: name, required, state, level };
  };
  const skillDetails = [...opp.requiredSkills.map(s => detail(s, true)), ...opp.preferredSkills.map(s => detail(s, false))];
  let skillScore = 0.5;
  if (skillDetails.length > 0) {
    let got = 0;
    let max = 0;
    for (const d of skillDetails) {
      const w = d.required ? 1 : 0.5;
      got += w * Math.min(1, d.level / bar);
      max += w;
    }
    skillScore = got / max;
  }

  // ── Career alignment (25%) ──
  let career = 0.4;
  if (role) {
    const roleSkills = new Set(role.skills.map(s => s.skill));
    const considered = [...opp.requiredSkills, ...(opp.teaches ?? [])].map(s => canonicalSkill(s) ?? s);
    const overlap = considered.length ? considered.filter(s => roleSkills.has(s)).length / considered.length : 0;
    const direct = opp.roles.includes(role.id) ? 1 : opp.roles.some(r => student.career.targetRoles.includes(r)) ? 0.7 : 0;
    career = Math.max(direct, overlap * 0.7);
    if ((opp.teaches ?? []).some(s => ctx.gapSkills.has(canonicalSkill(s) ?? s))) career = Math.min(1, career + 0.2);
  }

  // ── Experience level (15%) ──
  let experience = 1;
  if (opp.experienceLevel !== 'Any') {
    const diff = LEVEL_INDEX[student.career.experienceLevel] - LEVEL_INDEX[opp.experienceLevel];
    experience = diff >= 2 ? 0.8 : diff >= 0 ? 1 : diff === -1 ? 0.5 : 0.15;
  }

  // ── Interest match (10%) ──
  const tokens = [
    ...student.interests,
    ...student.career.careerInterests,
    ...student.career.targetIndustries,
    ...(role?.industries ?? []),
  ].map(s => s.toLowerCase());
  let interest = 0.5;
  let matchedTags: string[] = [];
  if (tokens.length > 0 && opp.tags.length > 0) {
    matchedTags = opp.tags.filter(tag => tokens.some(tok => tok.includes(tag.toLowerCase()) || tag.toLowerCase().includes(tok)));
    interest = Math.min(1, matchedTags.length / Math.min(2, opp.tags.length));
  }

  // ── Location / remote preference (5%) ──
  const mode = student.career.opportunityPreferences.workMode;
  const city = student.location.split(',')[0].trim().toLowerCase();
  const isLocal = /campus/i.test(opp.location) || (city !== '' && opp.location.toLowerCase().includes(city));
  let location: number;
  if (opp.remote) location = mode === 'onsite' ? 0.6 : 1;
  else if (mode === 'remote') location = 0.1;
  else location = isLocal ? 1 : 0.4;

  // ── Deadline fit (5%) ──
  let daysLeft: number | undefined;
  let deadline = 0.8;
  let expired = false;
  if (opp.deadline) {
    daysLeft = daysBetween(now, opp.deadline);
    if (daysLeft < 0) {
      expired = true;
      deadline = 0;
    } else deadline = daysLeft <= 2 ? 0.5 : daysLeft <= 45 ? 1 : 0.8;
  }

  const components = { skill: skillScore, career, experience, interest, location, deadline };
  const score = round(
    100 *
      (MATCH_WEIGHTS.skill * skillScore +
        MATCH_WEIGHTS.career * career +
        MATCH_WEIGHTS.experience * experience +
        MATCH_WEIGHTS.interest * interest +
        MATCH_WEIGHTS.location * location +
        MATCH_WEIGHTS.deadline * deadline),
  );

  const required = skillDetails.filter(d => d.required);
  const haveReq = required.filter(d => d.state === 'have');
  const reasons: string[] = [];
  if (required.length > 0) {
    reasons.push(
      haveReq.length > 0
        ? `You meet ${haveReq.length} of ${required.length} required skills (${haveReq.slice(0, 3).map(d => d.skill).join(', ')}).`
        : `You don't yet meet the ${required.length} required skill${required.length > 1 ? 's' : ''}, so this is a stretch.`,
    );
  } else if (opp.teaches?.length) {
    reasons.push(`Builds ${opp.teaches.join(', ')}.`);
  }
  if (role && opp.roles.includes(role.id)) reasons.push(`Directly aligned with your ${role.title} goal.`);
  const closing = (opp.teaches ?? []).find(s => ctx.gapSkills.has(canonicalSkill(s) ?? s));
  if (closing) reasons.push(`Helps close your ${closing} gap.`);
  if (matchedTags.length > 0) reasons.push(`Matches your interest in ${matchedTags[0]}.`);
  if (opp.remote) reasons.push('Remote-friendly.');
  if (daysLeft !== undefined && !expired && daysLeft <= 14) reasons.push(`Closes in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`);

  return {
    opportunity: opp,
    score: Math.max(0, Math.min(100, score)),
    components,
    skillDetails,
    missing: skillDetails.filter(d => d.state === 'missing').map(d => d.skill),
    reasons: reasons.slice(0, 4),
    daysLeft,
    expired,
  };
}

export function rankOpportunities(opps: Opportunity[], ctx: MatchContext): ScoredOpportunity[] {
  return opps.map(o => scoreOpportunity(o, ctx)).sort((a, b) => b.score - a.score);
}

/** Adapt an existing TRYBE Work project into the opportunity shape (no duplicate system). */
export function projectToOpportunity(p: Project): Opportunity {
  const norm = (s: string) => canonicalSkill(s) ?? s;
  const required = Array.from(new Set(p.skills.map(norm)));
  const preferred = Array.from(new Set(p.technologies.map(norm))).filter(s => !required.includes(s)).slice(0, 4);
  return {
    id: `work:${p.id}`,
    title: p.title,
    organization: p.ownerName,
    type: 'project',
    description: p.description,
    requiredSkills: required,
    preferredSkills: preferred,
    experienceLevel: 'Any',
    location: p.campusType === 'in-campus' ? 'On campus' : 'Off campus (online)',
    remote: p.campusType === 'off-campus',
    deadline: p.deadline,
    postedAt: p.createdAt,
    tags: [p.projectType, ...p.skills],
    roles: [],
    internalPath: '/work',
    source: 'work',
  };
}
