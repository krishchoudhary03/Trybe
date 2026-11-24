import type {
  MentorInsights,
  SessionPlan,
  SessionSummary,
  StudentSnapshot,
} from '../types';
import { daysBetween } from './util';

const DEPLOY_SKILLS = ['Docker', 'Cloud'];

/** Deterministic mentor insight — facts only, derived from the student's data. */
export function buildMentorInsights(snap: StudentSnapshot): MentorInsights {
  const { student, analysis, progress, role, opportunities, now } = snap;
  const first = student.name.split(' ')[0];

  if (!role || !analysis) {
    return {
      summary: `${first} has not chosen a target role yet, so there is no readiness analysis to review.`,
      strengths: [],
      concerns: ['Career profile incomplete — no target role selected.'],
      discussionTopics: ['Help them choose a target role and rate their current skills.'],
      actionItems: [{ id: 'mentor-profile', title: 'Complete the career profile', reason: 'Unlocks readiness, roadmap and matches.', estimatedHours: 0.25 }],
    };
  }

  // Strengths
  const strengths: string[] = analysis.strengths.slice(0, 3).map(s => `${s.skill} at ${s.level}/${s.target}`);
  for (const s of snap.skills.filter(s => (s.latestAssessment ?? 0) >= 80)) {
    if (!strengths.some(x => x.startsWith(s.name))) strengths.push(`Verified ${s.name}: ${s.latestAssessment}% on assessment`);
  }
  if (student.projects.length >= 2) strengths.push(`Project building — ${student.projects.length} projects completed`);
  else if (student.projects.length === 1) strengths.push('Has built a first project');
  if (student.career.certifications.length > 0) strengths.push(`${student.career.certifications.length} certification${student.career.certifications.length > 1 ? 's' : ''} earned`);
  if (progress.overall >= 50 && progress.overdueTasks.length === 0) strengths.push(`Consistent progress — ${progress.overall}% of the roadmap done, none overdue`);
  const applied = Object.values(student.opportunityStatus).filter(s => s === 'applied').length;
  if (applied > 0) strengths.push(`Has applied to ${applied} opportunit${applied > 1 ? 'ies' : 'y'}`);

  // Concerns
  const concerns: string[] = [];
  const deploy = analysis.items.filter(i => DEPLOY_SKILLS.includes(i.skill) && i.coverage < 0.5);
  if (deploy.length > 0) concerns.push(`Weak deployment experience (${deploy.map(d => d.skill).join(', ')})`);
  for (const c of analysis.critical.filter(c => !DEPLOY_SKILLS.includes(c.skill)).slice(0, 2)) {
    concerns.push(`Critical gap: ${c.skill} (${c.level}/${c.target})`);
  }
  for (const s of snap.skills.filter(s => (s.latestAssessment ?? 100) < 60)) {
    concerns.push(`Weak assessment result in ${s.name} (${s.latestAssessment}%)`);
  }
  if (student.projects.length === 0) concerns.push('No projects added yet');
  if (progress.overdueTasks.length > 0) concerns.push(`${progress.overdueTasks.length} overdue roadmap task${progress.overdueTasks.length > 1 ? 's' : ''}`);
  const matched = opportunities.filter(o => !o.expired && o.score >= 60);
  if (applied === 0 && matched.length > 0) concerns.push(`No applications yet despite ${matched.length} strong match${matched.length > 1 ? 'es' : ''}`);
  const lastSession = student.sessions.map(s => s.date).sort().pop();
  if (!lastSession) concerns.push('No mentor sessions recorded yet');
  else if (daysBetween(lastSession, now) > 30) concerns.push(`No mentor session for ${daysBetween(lastSession, now)} days`);

  // Discussion topics
  const topics: string[] = [];
  const weak = snap.skills.find(s => (s.latestAssessment ?? 100) < 60);
  const topGap = analysis.critical[0] ?? analysis.needsImprovement[0];
  if (weak) topics.push(`Walk through the ${weak.name} assessment (${weak.latestAssessment}%) and agree on a review plan`);
  else if (topGap) topics.push(`Plan how to close the ${topGap.skill} gap (${topGap.level}/${topGap.target})`);
  if (deploy.length > 0) topics.push(`Discuss ${deploy[0].skill} deployment — which existing project can they ship?`);
  const lastProject = student.projects[student.projects.length - 1];
  if (lastProject) topics.push(`Review “${lastProject.title}” and how it can evidence ${topGap?.skill ?? 'the target skills'}`);
  const hot = matched.filter(o => !student.opportunityStatus[o.opportunity.id]).sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999))[0];
  if (hot) topics.push(`Discuss applying to ${hot.opportunity.title}${hot.daysLeft !== undefined ? ` (closes in ${hot.daysLeft} days)` : ''}`);
  if (progress.behind) topics.push('Agree on a realistic weekly study schedule — the roadmap is behind');
  const open = student.sessions.flatMap(s => s.actionItems).filter(a => !a.done);
  if (open.length > 0) topics.push(`Follow up on ${open.length} open action item${open.length > 1 ? 's' : ''} from the last session`);
  if (topics.length < 3) topics.push(snap.nextBestAction.title);

  const actionItems = [snap.nextBestAction, ...snap.alternatives]
    .filter((a, i, arr) => arr.findIndex(b => b.title === a.title) === i)
    .slice(0, 4)
    .map(a => ({ id: a.id, title: a.title, reason: a.reason, estimatedHours: a.estimatedHours, skill: a.relatedSkill }));

  const gapNames = analysis.critical.slice(0, 2).map(c => c.skill);
  const summary =
    `${first} is aiming for ${role.title} with ${analysis.readiness}% readiness and ${progress.overall}% of the roadmap complete` +
    `${progress.behind ? ', and is currently behind schedule' : ''}. ` +
    (analysis.strengths.length ? `Strongest areas: ${analysis.strengths.slice(0, 2).map(s => s.skill).join(', ')}. ` : '') +
    (gapNames.length ? `Biggest gaps: ${gapNames.join(', ')}.` : 'No critical gaps right now.');

  return {
    summary,
    strengths: strengths.slice(0, 5),
    concerns: concerns.slice(0, 5),
    discussionTopics: topics.slice(0, 5),
    actionItems,
  };
}

export function buildSessionPlan(insights: MentorInsights, total = 45): SessionPlan {
  const topics = insights.discussionTopics.slice(0, 4);
  const wrap = 5;
  const pool = total - wrap;
  const weights = [4, 3, 2, 2].slice(0, topics.length);
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const agenda = topics.map((topic, i) => ({ topic, minutes: Math.max(5, Math.round((pool * weights[i]) / sum / 5) * 5) }));
  agenda.push({ topic: 'Wrap-up: confirm action items and next session date', minutes: wrap });
  return {
    agenda,
    goals: insights.actionItems.slice(0, 3).map(a => `By next session: ${a.title}`),
  };
}

const ACTION_LINE = /^\s*(?:[-•*]|\d+[.)])\s*/;
const ACTION_WORDS = /\b(todo|to-do|action|will|should|need to|needs to|must|by next|follow up)\b/i;

/** Rules-based session recap used when AI is unavailable. Action items come only from the mentor's own notes. */
export function fallbackSessionSummary(snap: StudentSnapshot, insights: MentorInsights, notes: string): SessionSummary {
  const lines = notes.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const actionItems = lines
    .filter(l => ACTION_LINE.test(l) || ACTION_WORDS.test(l))
    .map(l => l.replace(ACTION_LINE, '').trim())
    .filter(Boolean)
    .slice(0, 6);
  const prose = lines.filter(l => !ACTION_LINE.test(l)).join(' ');
  const recap = (prose || lines.join(' ')).slice(0, 280);
  return {
    summary: recap ? `Session recap: ${recap}${recap.length >= 280 ? '…' : ''}` : `Session with ${snap.student.name.split(' ')[0]} recorded.`,
    strengths: insights.strengths.slice(0, 2),
    concerns: insights.concerns.slice(0, 2),
    actionItems,
    nextSessionGoals: insights.actionItems.slice(0, 3).map(a => a.title),
  };
}
