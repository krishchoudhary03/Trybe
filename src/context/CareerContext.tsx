import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useApp } from './AppContext';
import type {
  AssessmentResult,
  CareerProfile,
  CopilotMessage,
  MentorSession,
  Opportunity,
  OpportunityStatus,
  Roadmap,
  StudentRecord,
  StudentSnapshot,
} from '../career/types';
import { DEFAULT_CAREER_PROFILE } from '../career/data/defaults';
import { getRole } from '../career/data/roles';
import { buildSampleOpportunities } from '../career/data/opportunities';
import { deriveSkills } from '../career/engine/skills';
import {
  adaptRoadmapForAssessment,
  addActionTask as engineAddActionTask,
  buildRoadmap,
  findTask,
  promoteGapAction,
  rebalanceSchedule,
  setTaskDone as engineSetTaskDone,
  STRONG_SCORE,
  WEAK_SCORE,
  type ActionTaskInput,
} from '../career/engine/roadmap';
import { projectToOpportunity } from '../career/engine/opportunities';
import { buildRoadmapContext, buildSnapshot, EMPTY_CAREER, resolveCareer } from '../career/engine/snapshot';
import { buildMenteeRecords, MENTOR_ID } from '../career/engine/mentees';
import { clamp, round, uid } from '../career/engine/util';
import { supabase } from '../lib/supabase';
import { careerService } from '../services/careerService';

export const SELF_ID = 'me';

// ── persistence: same `trybee_` localStorage convention as AppContext ──
// Stored data can be stale or hand-edited, so every read is shape-checked and falls back safely.
function load<T>(key: string, fallback: T, valid: (v: unknown) => boolean = () => true): T {
  try {
    const raw = localStorage.getItem(`trybee_${key}`);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return valid(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`trybee_${key}`, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

const isArray = (v: unknown) => Array.isArray(v);
const isRecord = (v: unknown) => typeof v === 'object' && v !== null && !Array.isArray(v);
const isRoadmap = (v: unknown) =>
  isRecord(v) &&
  typeof (v as { roleId?: unknown }).roleId === 'string' &&
  Array.isArray((v as { phases?: unknown }).phases) &&
  Array.isArray((v as { adaptations?: unknown }).adaptations) &&
  (v as { phases: unknown[] }).phases.every(p => isRecord(p) && Array.isArray((p as { tasks?: unknown }).tasks));

interface CareerContextValue {
  now: string;
  profile: CareerProfile;
  /** The signed-in student as a plain record (same shape the engine uses for mentees). */
  student: StudentRecord;
  /** Everything the five career features need, derived from one place. */
  snapshot: StudentSnapshot;
  opportunities: Opportunity[];
  mentees: StudentRecord[];
  sessions: MentorSession[];
  copilotThread: CopilotMessage[];

  updateCareerProfile: (patch: Partial<CareerProfile>, silent?: boolean) => void;
  setTargetRole: (roleId: string) => void;
  resetCareerProfile: () => void;

  setTaskDone: (taskId: string, done: boolean, opts?: { score?: number }) => void;
  recordAssessment: (skill: string, score: number, source?: AssessmentResult['source']) => void;
  addGapToRoadmap: (skill: string) => void;
  addActionTask: (input: ActionTaskInput) => void;
  rebalanceRoadmap: () => void;
  regenerateRoadmap: () => void;

  setOpportunityStatus: (id: string, status: OpportunityStatus | null) => void;

  saveMentorSession: (session: MentorSession) => void;
  toggleSessionAction: (itemId: string, done: boolean) => void;

  appendCopilot: (msg: CopilotMessage) => void;
  updateCopilot: (id: string, patch: Partial<CopilotMessage>) => void;
  clearCopilot: () => void;
}

const CareerContext = createContext<CareerContextValue | null>(null);

export function CareerProvider({ children }: { children: ReactNode }) {
  const { userProfile, projects, updateUserProfile, showToast } = useApp();

  const [now, setNow] = useState(() => new Date().toISOString());
  const lastTick = useRef(Date.now());
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastTick.current > 5 * 60_000) {
        lastTick.current = Date.now();
        setNow(new Date().toISOString());
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const profile = useMemo(() => resolveCareer(userProfile.career, DEFAULT_CAREER_PROFILE), [userProfile.career]);

  const [assessments, setAssessments] = useState<AssessmentResult[]>(() => load<AssessmentResult[]>('career_assessments', [], isArray));
  const [opportunityStatus, setOpportunityStatusState] = useState<Record<string, OpportunityStatus>>(() => load<Record<string, OpportunityStatus>>('career_opp_status', {}, isRecord));
  const [sessions, setSessions] = useState<MentorSession[]>(() => load<MentorSession[]>('career_sessions', [], isArray));
  const [actionDone, setActionDone] = useState<Record<string, boolean>>(() => load<Record<string, boolean>>('career_action_done', {}, isRecord));
  const [copilotThread, setCopilotThread] = useState<CopilotMessage[]>(() => load<CopilotMessage[]>('career_thread', [], isArray));

  // Opportunities: sample listings + existing TRYBE Work projects (no second opportunity system).
  const sampleOpps = useMemo(() => buildSampleOpportunities(new Date(now)), [now.slice(0, 10)]); // eslint-disable-line react-hooks/exhaustive-deps
  const opportunities = useMemo<Opportunity[]>(() => {
    const work = projects.filter(p => !p.isOwn && p.ownerId !== userProfile.username).map(projectToOpportunity);
    return [...sampleOpps, ...work];
  }, [sampleOpps, projects, userProfile.username]);

  const withDone = useCallback(
    (list: MentorSession[]) =>
      list.map(s => ({ ...s, actionItems: s.actionItems.map(a => ({ ...a, done: actionDone[a.id] ?? a.done })) })),
    [actionDone],
  );

  // The student record is composed from data TRYBE already stores — nothing is duplicated.
  const makeStudent = useCallback(
    (roadmap: Roadmap | null, assess: AssessmentResult[] = assessments): StudentRecord => ({
      id: SELF_ID,
      name: userProfile.name,
      avatar: userProfile.avatar,
      college: userProfile.college,
      skills: userProfile.skills,
      interests: userProfile.interests,
      location: userProfile.location,
      projects: projects.filter(p => p.isOwn).map(p => ({ id: p.id, title: p.title, technologies: p.technologies, skills: p.skills })),
      career: profile,
      assessments: assess,
      roadmap,
      opportunityStatus,
      sessions: withDone(sessions.filter(s => s.studentId === SELF_ID)),
    }),
    [userProfile, projects, profile, assessments, opportunityStatus, sessions, withDone],
  );

  const [roadmap, setRoadmap] = useState<Roadmap | null>(() => {
    const stored = load<Roadmap | null>('career_roadmap', null, isRoadmap);
    if (stored) return stored;
    // first visit: plan synchronously so the first paint already has a roadmap
    const firstRole = getRole(profile.targetRoles[0]);
    if (!firstRole) return null;
    const s = makeStudent(null);
    return buildRoadmap(buildRoadmapContext(s, firstRole, deriveSkills(s, null), now), null);
  });
  const roadmapRef = useRef<Roadmap | null>(roadmap);
  const commit = useCallback((next: Roadmap | null) => {
    roadmapRef.current = next;
    setRoadmap(next);
  }, []);

  const student = useMemo(() => makeStudent(roadmap), [makeStudent, roadmap]);
  const studentRef = useRef(student);
  studentRef.current = student;

  // Re-plan whenever the target role or the student's *entry* levels change. Completed work,
  // adaptive review tasks and action-plan tasks are preserved by buildRoadmap.
  const role = getRole(profile.targetRoles[0]);
  const entrySig = useMemo(
    () => JSON.stringify(deriveSkills(student).map(s => [s.name, s.entryLevel])),
    [student],
  );
  useEffect(() => {
    if (!role) return;
    const s = studentRef.current;
    const prev = roadmapRef.current;
    const next = buildRoadmap(buildRoadmapContext({ ...s, roadmap: prev }, role, deriveSkills({ ...s, roadmap: prev }, prev), now), prev);
    if (next !== prev) commit(next);
  }, [role?.id, entrySig, profile.weeklyLearningHours, now, commit]); // eslint-disable-line react-hooks/exhaustive-deps

  const snapshot = useMemo(() => buildSnapshot(student, opportunities, now), [student, opportunities, now]);

  const mentees = useMemo(
    () =>
      buildMenteeRecords(sampleOpps, now).map(m => ({
        ...m,
        sessions: withDone([...m.sessions, ...sessions.filter(s => s.studentId === m.id)]),
      })),
    [sampleOpps, now, sessions, withDone],
  );

  // ── persistence ──
  useEffect(() => save('career_roadmap', roadmap), [roadmap]);
  useEffect(() => save('career_assessments', assessments), [assessments]);
  useEffect(() => save('career_opp_status', opportunityStatus), [opportunityStatus]);
  useEffect(() => save('career_sessions', sessions), [sessions]);
  useEffect(() => save('career_action_done', actionDone), [actionDone]);
  useEffect(() => save('career_thread', copilotThread.slice(-20)), [copilotThread]);

  // ── Supabase live hydration ──
  useEffect(() => {
    const hydrateFromSupabase = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // 1. Hydrate opportunity statuses
        const { data: oppStatuses } = await supabase
          .from('user_opportunity_status')
          .select('opportunity_id, status')
          .eq('user_id', session.user.id);

        if (oppStatuses && oppStatuses.length > 0) {
          const map: Record<string, OpportunityStatus> = {};
          oppStatuses.forEach(item => {
            if (item.status) map[item.opportunity_id] = item.status as OpportunityStatus;
          });
          setOpportunityStatusState(prev => ({ ...map, ...prev }));
        }

        // 2. Hydrate assessments
        const { data: dbAssessments } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', session.user.id)
          .order('taken_at', { ascending: true });

        if (dbAssessments && dbAssessments.length > 0) {
          const mapped: AssessmentResult[] = dbAssessments.map(a => ({
            id: a.id,
            skill: ((a.metadata as Record<string, unknown>)?.skill_name as string) || 'General Skill',
            score: Number(a.score) || 0,
            takenAt: a.taken_at || new Date().toISOString(),
            source: (a.source as AssessmentResult['source']) || 'manual',
          }));
          setAssessments(prev => {
            const combined = [...prev, ...mapped];
            const seen = new Set<string>();
            return combined.filter(it => {
              if (seen.has(it.id)) return false;
              seen.add(it.id);
              return true;
            });
          });
        }
      } catch (err) {
        console.warn('CareerContext Supabase hydration note:', err);
      }
    };

    hydrateFromSupabase();
  }, []);

  // ── profile ──
  const updateCareerProfile = useCallback(
    (patch: Partial<CareerProfile>, silent = false) => {
      updateUserProfile({ career: { ...profile, ...patch } }, silent);
    },
    [profile, updateUserProfile],
  );

  const setTargetRole = useCallback(
    (roleId: string) => {
      const r = getRole(roleId);
      if (!r) return;
      const rest = profile.targetRoles.filter(x => x !== roleId);
      updateUserProfile({ career: { ...profile, targetRoles: [roleId, ...rest] } }, true);
      showToast(`Target role set to ${r.title}. Your roadmap is being re-planned.`);
    },
    [profile, updateUserProfile, showToast],
  );

  const resetCareerProfile = useCallback(() => {
    updateUserProfile({ career: { ...EMPTY_CAREER } }, true);
    commit(null);
    setAssessments([]);
    showToast('Career profile cleared.', 'info');
  }, [updateUserProfile, commit, showToast]);

  // ── roadmap ──
  const weekly = profile.weeklyLearningHours;

  const setTaskDone = useCallback(
    (taskId: string, done: boolean, opts?: { score?: number }) => {
      const cur = roadmapRef.current;
      if (!cur) return;
      const task = findTask(cur, taskId);
      if (!task) return;
      const stamp = new Date().toISOString();
      let next = engineSetTaskDone(cur, taskId, done, stamp, weekly);

      const gradable = done && (task.tier === 'assessment' || task.tier === 'retake') && opts?.score !== undefined;
      if (gradable) {
        const a: AssessmentResult = {
          id: uid('as'), skill: task.skill, score: clamp(round(opts!.score!)), takenAt: stamp, source: 'roadmap',
        };
        next = adaptRoadmapForAssessment(next, a, stamp, weekly);
        setAssessments(prev => [...prev, a]);
        if (a.score < WEAK_SCORE) showToast(`${a.skill} scored ${a.score}% — review and practice tasks were added.`, 'info');
        else if (a.score >= STRONG_SCORE) showToast(`${a.skill} scored ${a.score}% — beginner content skipped.`);
        else showToast(`${a.skill} check logged: ${a.score}%.`);

        // Async sync assessment to Supabase
        supabase.auth.getUser().then(({ data: user }) => {
          if (user?.user) {
            supabase.from('assessments').insert({
              user_id: user.user.id,
              score: a.score,
              source: 'roadmap',
              taken_at: a.takenAt,
              metadata: { skill_name: a.skill, task_id: taskId },
            }).catch(() => null);
          }
        }).catch(() => null);
      } else if (done) {
        showToast(task.skillGain > 0 && task.skill ? `Task complete — ${task.skill} +${task.skillGain}` : 'Task complete!');
      }
      commit(next);

      // Async sync task completion with Supabase
      if (done) {
        careerService.completeTask(taskId).catch(() => null);
      }
    },
    [weekly, commit, showToast],
  );

  const recordAssessment = useCallback(
    (skill: string, score: number, source: AssessmentResult['source'] = 'manual') => {
      const stamp = new Date().toISOString();
      const a: AssessmentResult = { id: uid('as'), skill, score: clamp(round(score)), takenAt: stamp, source };
      let next = roadmapRef.current;
      if (next) {
        const pending = next.phases.flatMap(p => p.tasks).find(t => t.skill === skill && t.status === 'todo' && (t.tier === 'assessment' || t.tier === 'retake'));
        if (pending) next = engineSetTaskDone(next, pending.id, true, stamp, weekly);
        next = adaptRoadmapForAssessment(next, a, stamp, weekly);
        commit(next);
      }
      setAssessments(prev => [...prev, a]);
      if (a.score < WEAK_SCORE) showToast(`${skill} scored ${a.score}% — review tasks were added to your roadmap.`, 'info');
      else showToast(`${skill} skill check saved: ${a.score}%.`);

      // Async sync assessment to Supabase
      supabase.auth.getUser().then(({ data: user }) => {
        if (user?.user) {
          supabase.from('assessments').insert({
            user_id: user.user.id,
            score: a.score,
            source: a.source,
            taken_at: a.takenAt,
            metadata: { skill_name: skill },
          }).catch(() => null);
        }
      }).catch(() => null);
    },
    [weekly, commit, showToast],
  );

  const addGapToRoadmap = useCallback(
    (skill: string) => {
      const cur = roadmapRef.current;
      if (!cur) return;
      const res = promoteGapAction(cur, skill, studentRef.current, new Date().toISOString(), weekly);
      if (res.added) {
        commit(res.roadmap);
        showToast(`Added a ${skill} action to your roadmap.`);
      } else showToast('Already on your roadmap.', 'info');
    },
    [weekly, commit, showToast],
  );

  const addActionTask = useCallback(
    (input: ActionTaskInput) => {
      const cur = roadmapRef.current;
      if (!cur) {
        showToast('Choose a target role first to start a roadmap.', 'info');
        return;
      }
      const next = engineAddActionTask(cur, input, new Date().toISOString(), weekly);
      if (next === cur) showToast('Already on your roadmap.', 'info');
      else {
        commit(next);
        showToast('Added to your roadmap.');
      }
    },
    [weekly, commit, showToast],
  );

  const rebalanceRoadmap = useCallback(() => {
    const cur = roadmapRef.current;
    if (!cur) return;
    commit(rebalanceSchedule(cur, new Date().toISOString(), weekly));
    showToast('Schedule rebalanced around your weekly hours.');
  }, [weekly, commit, showToast]);

  const regenerateRoadmap = useCallback(() => {
    if (!role) return;
    const s = studentRef.current;
    const prev = roadmapRef.current;
    const stamp = new Date().toISOString();
    const next = buildRoadmap(buildRoadmapContext({ ...s, roadmap: prev }, role, deriveSkills({ ...s, roadmap: prev }, prev), stamp), prev);
    commit(next);
    showToast('Roadmap refreshed from your latest skills.');
  }, [role, commit, showToast]);

  // ── opportunities ──
  const setOpportunityStatus = useCallback((id: string, status: OpportunityStatus | null) => {
    setOpportunityStatusState(prev => {
      const next = { ...prev };
      if (status === null) delete next[id];
      else next[id] = status;
      return next;
    });

    // Async sync with Supabase
    careerService.setOpportunityStatus(id, status).catch(() => null);
  }, []);

  // ── mentor ──
  const saveMentorSession = useCallback((session: MentorSession) => {
    setSessions(prev => [...prev.filter(s => s.id !== session.id), session]);
  }, []);
  const toggleSessionAction = useCallback((itemId: string, done: boolean) => {
    setActionDone(prev => ({ ...prev, [itemId]: done }));
  }, []);

  // ── copilot thread ──
  const appendCopilot = useCallback((msg: CopilotMessage) => setCopilotThread(prev => [...prev, msg]), []);
  const updateCopilot = useCallback(
    (id: string, patch: Partial<CopilotMessage>) => setCopilotThread(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m))),
    [],
  );
  const clearCopilot = useCallback(() => setCopilotThread([]), []);

  const value = useMemo<CareerContextValue>(
    () => ({
      now, profile, student, snapshot, opportunities, mentees, sessions: withDone(sessions), copilotThread,
      updateCareerProfile, setTargetRole, resetCareerProfile,
      setTaskDone, recordAssessment, addGapToRoadmap, addActionTask, rebalanceRoadmap, regenerateRoadmap,
      setOpportunityStatus, saveMentorSession, toggleSessionAction,
      appendCopilot, updateCopilot, clearCopilot,
    }),
    [
      now, profile, student, snapshot, opportunities, mentees, sessions, withDone, copilotThread,
      updateCareerProfile, setTargetRole, resetCareerProfile, setTaskDone, recordAssessment, addGapToRoadmap,
      addActionTask, rebalanceRoadmap, regenerateRoadmap, setOpportunityStatus, saveMentorSession,
      toggleSessionAction, appendCopilot, updateCopilot, clearCopilot,
    ],
  );

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareer(): CareerContextValue {
  const ctx = useContext(CareerContext);
  if (!ctx) throw new Error('useCareer must be used within CareerProvider');
  return ctx;
}

export { MENTOR_ID };
