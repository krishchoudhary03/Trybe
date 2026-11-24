// ─────────────────────────────────────────
// Career Intelligence Layer — shared domain types
// ─────────────────────────────────────────

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type WorkMode = 'any' | 'remote' | 'onsite';
export type Priority = 'high' | 'medium' | 'low';
export type SkillStatus = 'strong' | 'needs_improvement' | 'critical';

export type OpportunityType =
  | 'internship'
  | 'job'
  | 'hackathon'
  | 'certification'
  | 'competition'
  | 'project'
  | 'research';

// ── Career profile (extends the existing TRYBE UserProfile) ─────────────

export interface Certification {
  id: string;
  name: string;
  /** Canonical skill names this certification evidences. */
  skills: string[];
  earnedAt?: string;
}

export interface CareerGoal {
  id: string;
  title: string;
  targetDate?: string;
}

export interface LearningPreferences {
  style: 'videos' | 'reading' | 'projects' | 'mixed';
  pace: 'relaxed' | 'steady' | 'intensive';
}

/**
 * Stored on `UserProfile.career`. Skills / interests / projects are NOT duplicated
 * here — they are read from the existing TRYBE profile and Work data. Only the
 * career-specific information lives in this object.
 */
export interface CareerProfile {
  /** Role ids (see data/roles.ts). The first entry is the primary target. */
  targetRoles: string[];
  targetIndustries: string[];
  experienceLevel: ExperienceLevel;
  /** Self-rated levels (0–100) keyed by canonical skill name. */
  skillLevels: Record<string, number>;
  careerInterests: string[];
  careerGoals: CareerGoal[];
  learningPreferences: LearningPreferences;
  weeklyLearningHours: number;
  opportunityPreferences: { workMode: WorkMode };
  certifications: Certification[];
}

/** Derived (never stored): a student's evidence-backed level in one skill. */
export interface SkillProfile {
  name: string;
  /** Final level 0–100 (assessment-weighted when an assessment exists). */
  level: number;
  /** Level before roadmap task gains — used to plan the roadmap without double counting. */
  entryLevel: number;
  evidence: string[];
  verified: boolean;
  /** True when the student listed this skill on their TRYBE profile. */
  claimed: boolean;
  latestAssessment?: number;
}

// ── Roles & skill requirements ──────────────────────────────────────────

export interface RoleSkillRequirement {
  skill: string;
  /** Level (0–100) a job-ready student is expected to reach. */
  target: number;
  /** Relative importance. Normalised at calculation time. */
  weight: number;
  /** Core skills are flagged critical earlier when they lag. */
  core?: boolean;
}

export interface RolePhaseDef {
  title: string;
  description: string;
  skills: string[];
}

export interface CareerRole {
  id: string;
  title: string;
  summary: string;
  industries: string[];
  skills: RoleSkillRequirement[];
  recommendedSkills: string[];
  phases: RolePhaseDef[];
}

export interface TaskTemplate {
  key: string;
  title: string;
  description: string;
  hours: number;
}

export interface SkillPlaybook {
  skill: string;
  aliases: string[];
  why: string;
  foundation: TaskTemplate[];
  core: TaskTemplate[];
  project: TaskTemplate;
  review: string[];
  /** skill → factor: a student with this skill is credited with a fraction in the other skill. */
  implies?: Record<string, number>;
}

// ── Skill-gap analysis ──────────────────────────────────────────────────

export interface GapAction {
  title: string;
  how: string;
  estimatedHours: number;
}

export interface SkillGapItem {
  skill: string;
  level: number;
  target: number;
  gap: number;
  /** level / target, capped at 1 */
  coverage: number;
  weight: number;
  core: boolean;
  status: SkillStatus;
  /** Share of the student's total weighted gap this skill represents (0–1). */
  impact: number;
  whyItMatters: string;
  action: GapAction;
}

export interface ReadinessBreakdownItem {
  key: 'skills' | 'evidence' | 'progress';
  label: string;
  weightPct: number;
  scorePct: number;
  detail: string;
}

export interface SkillGapAnalysis {
  roleId: string;
  roleTitle: string;
  readiness: number;
  breakdown: ReadinessBreakdownItem[];
  items: SkillGapItem[];
  strengths: SkillGapItem[];
  needsImprovement: SkillGapItem[];
  critical: SkillGapItem[];
}

// ── Roadmap ─────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'completed' | 'skipped';
export type TaskTier =
  | 'foundation'
  | 'core'
  | 'project'
  | 'assessment'
  | 'review'
  | 'practice'
  | 'retake'
  | 'action';
export type TaskOrigin = 'template' | 'adaptive' | 'gap' | 'mentor' | 'copilot' | 'opportunity';

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  skill: string;
  tier: TaskTier;
  estimatedHours: number;
  status: TaskStatus;
  completedAt?: string;
  dueAt?: string;
  /** Points added to the skill level when this task is completed. */
  skillGain: number;
  origin: TaskOrigin;
  /** Why the task exists / why it was skipped. */
  note?: string;
}

export type PhaseStatus = 'completed' | 'in_progress' | 'upcoming' | 'proficient';

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  skills: string[];
  tasks: RoadmapTask[];
  estimatedHours: number;
  status: PhaseStatus;
  adaptiveNote?: string;
}

export interface AdaptationEvent {
  id: string;
  at: string;
  kind: 'weak_assessment' | 'strong_assessment' | 'role_changed' | 'rebalanced' | 'regenerated';
  skill?: string;
  message: string;
}

export interface Roadmap {
  id: string;
  studentId: string;
  roleId: string;
  targetRole: string;
  phases: RoadmapPhase[];
  generatedAt: string;
  updatedAt: string;
  adaptations: AdaptationEvent[];
}

export interface AssessmentResult {
  id: string;
  skill: string;
  /** 0–100 */
  score: number;
  takenAt: string;
  source: 'roadmap' | 'manual';
}

// ── Opportunities ───────────────────────────────────────────────────────

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  /** Skills the opportunity helps you build (certifications, programs). */
  teaches?: string[];
  experienceLevel: ExperienceLevel | 'Any';
  location: string;
  remote: boolean;
  deadline?: string;
  postedAt: string;
  tags: string[];
  /** Role ids this opportunity is relevant to. */
  roles: string[];
  url?: string;
  /** In-app destination (used for opportunities sourced from TRYBE Work projects). */
  internalPath?: string;
  source: 'sample' | 'work';
}

export type OpportunityStatus = 'saved' | 'applied' | 'dismissed';

export interface SkillMatchDetail {
  skill: string;
  required: boolean;
  state: 'have' | 'partial' | 'missing';
  level: number;
}

export interface ScoredOpportunity {
  opportunity: Opportunity;
  /** 0–100 */
  score: number;
  components: {
    skill: number;
    career: number;
    experience: number;
    interest: number;
    location: number;
    deadline: number;
  };
  skillDetails: SkillMatchDetail[];
  missing: string[];
  reasons: string[];
  daysLeft?: number;
  expired: boolean;
}

// ── Next best action ────────────────────────────────────────────────────

export type ActionSource =
  | 'skill_gap'
  | 'roadmap'
  | 'assessment'
  | 'opportunity'
  | 'mentor'
  | 'profile'
  | 'project';

export type ActionKind =
  | 'learn_skill'
  | 'build_project'
  | 'take_assessment'
  | 'apply'
  | 'join_hackathon'
  | 'complete_task'
  | 'improve_weak_skill'
  | 'meet_mentor'
  | 'update_profile';

export type ActionTarget =
  | { type: 'task'; taskId: string }
  | { type: 'route'; to: string }
  | { type: 'opportunity'; id: string }
  | { type: 'assess'; skill: string }
  | { type: 'profile' };

export interface NextBestAction {
  id: string;
  title: string;
  reason: string;
  how: string;
  impact: Priority;
  estimatedHours: number;
  relatedSkill?: string;
  source: ActionSource;
  kind: ActionKind;
  ctaLabel: string;
  target: ActionTarget;
  priorityScore: number;
}

// ── Mentor ──────────────────────────────────────────────────────────────

export interface MentorActionItem {
  id: string;
  title: string;
  done: boolean;
}

export interface SessionSummary {
  summary: string;
  strengths: string[];
  concerns: string[];
  actionItems: string[];
  nextSessionGoals: string[];
}

export interface MentorSession {
  id: string;
  studentId: string;
  mentorId: string;
  date: string;
  notes: string;
  actionItems: MentorActionItem[];
  aiSummary?: string;
  aiRecommendations?: SessionSummary;
  summarySource?: 'ai' | 'rules';
}

export interface MentorInsights {
  summary: string;
  strengths: string[];
  concerns: string[];
  discussionTopics: string[];
  actionItems: { id: string; title: string; reason: string; estimatedHours: number; skill?: string }[];
}

export interface SessionPlanAgendaItem {
  topic: string;
  minutes: number;
}

export interface SessionPlan {
  agenda: SessionPlanAgendaItem[];
  goals: string[];
}

// ── Copilot ─────────────────────────────────────────────────────────────

export interface CopilotResponse {
  answer: string;
  nextBestAction?: string;
  reason?: string;
  priority: Priority;
  skill?: string;
  estimatedHours?: number;
  /** Only ids of real opportunities from TRYBE data. */
  opportunityIds?: string[];
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  at: string;
  response?: CopilotResponse;
  source?: 'ai' | 'rules';
  failed?: boolean;
}

// ── Student record & snapshot (the shared "student intelligence") ───────

export interface StudentProject {
  id: string;
  title: string;
  technologies: string[];
  skills: string[];
}

export interface StudentRecord {
  id: string;
  name: string;
  avatar?: string;
  college: string;
  /** Skills as listed on the student's TRYBE profile (free text). */
  skills: string[];
  interests: string[];
  location: string;
  projects: StudentProject[];
  career: CareerProfile;
  assessments: AssessmentResult[];
  roadmap: Roadmap | null;
  opportunityStatus: Record<string, OpportunityStatus>;
  sessions: MentorSession[];
}

export interface RoadmapProgress {
  /** Hours-weighted completion across active (non-skipped) tasks, 0–100. */
  overall: number;
  completedTasks: number;
  activeTasks: number;
  skippedTasks: number;
  overdueTasks: RoadmapTask[];
  behind: boolean;
}

export interface ProfileCompleteness {
  complete: boolean;
  missing: string[];
}

export interface StudentSnapshot {
  student: StudentRecord;
  role: CareerRole | null;
  skills: SkillProfile[];
  analysis: SkillGapAnalysis | null;
  progress: RoadmapProgress;
  opportunities: ScoredOpportunity[];
  nextBestAction: NextBestAction;
  alternatives: NextBestAction[];
  completeness: ProfileCompleteness;
  now: string;
}
