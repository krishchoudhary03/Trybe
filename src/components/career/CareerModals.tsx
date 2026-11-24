import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Modal } from '../Modal';
import { useApp } from '../../context/AppContext';
import { useCareer } from '../../context/CareerContext';
import { CAREER_ROLES } from '../../career/data/roles';
import { allCanonicalSkills, canonicalSkill } from '../../career/data/skills';
import { uid } from '../../career/engine/util';
import { STRONG_SCORE, WEAK_SCORE } from '../../career/engine/roadmap';
import type { Certification, CareerProfile, ExperienceLevel } from '../../career/types';
import { btnGhost, btnPrimary, inputCls, labelCls } from './ui';

interface ModalsApi {
  openProfile: () => void;
  openAssessment: (opts?: { skill?: string; taskId?: string }) => void;
}

const ModalsContext = createContext<ModalsApi | null>(null);

export function useCareerModals(): ModalsApi {
  const ctx = useContext(ModalsContext);
  if (!ctx) throw new Error('useCareerModals must be used within CareerModalsProvider');
  return ctx;
}

export function CareerModalsProvider({ children }: { children: ReactNode }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [assess, setAssess] = useState<{ skill?: string; taskId?: string } | null>(null);

  const openProfile = useCallback(() => setProfileOpen(true), []);
  const openAssessment = useCallback((opts?: { skill?: string; taskId?: string }) => setAssess(opts ?? {}), []);
  const api = useMemo(() => ({ openProfile, openAssessment }), [openProfile, openAssessment]);

  return (
    <ModalsContext.Provider value={api}>
      {children}
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <AssessmentModal opts={assess} onClose={() => setAssess(null)} />
    </ModalsContext.Provider>
  );
}

// ─────────────────────────────────────────
// Skill check (assessment score) dialog
// ─────────────────────────────────────────

function AssessmentModal({ opts, onClose }: { opts: { skill?: string; taskId?: string } | null; onClose: () => void }) {
  const { snapshot, recordAssessment, setTaskDone } = useCareer();
  const roleSkills = snapshot.role?.skills.map(s => s.skill) ?? [];
  const [skill, setSkill] = useState('');
  const [score, setScore] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (opts) {
      setSkill(opts.skill ?? roleSkills[0] ?? allCanonicalSkills()[0]);
      setScore('');
      setError('');
    }
  }, [opts]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => {
    const n = Number(score);
    if (score.trim() === '' || !Number.isFinite(n) || n < 0 || n > 100) {
      setError('Enter a score between 0 and 100.');
      return;
    }
    if (opts?.taskId) setTaskDone(opts.taskId, true, { score: n });
    else recordAssessment(skill, n, 'manual');
    onClose();
  };

  const others = allCanonicalSkills().filter(s => !roleSkills.includes(s));

  return (
    <Modal
      isOpen={opts !== null}
      onClose={onClose}
      size="sm"
      icon="fact_check"
      title="Log a skill check"
      subtitle="Use a practice test, course quiz or timed exercise score."
      footer={
        <>
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
          <button type="button" onClick={submit} className={btnPrimary}>Save result</button>
        </>
      }
    >
      <form
        className="flex flex-col gap-md"
        onSubmit={e => {
          e.preventDefault();
          submit();
        }}
      >
        <div>
          <label htmlFor="assess-skill" className={`${labelCls} block mb-xs`}>Skill</label>
          {opts?.skill ? (
            <p className="text-on-surface font-semibold">{opts.skill}</p>
          ) : (
            <select id="assess-skill" className={inputCls} value={skill} onChange={e => setSkill(e.target.value)}>
              {roleSkills.length > 0 && (
                <optgroup label="Your target role">{roleSkills.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
              )}
              <optgroup label="Other skills">{others.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
            </select>
          )}
        </div>
        <div>
          <label htmlFor="assess-score" className={`${labelCls} block mb-xs`}>Score (%)</label>
          <input
            id="assess-score"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            className={inputCls}
            value={score}
            onChange={e => {
              setScore(e.target.value);
              setError('');
            }}
            placeholder="e.g. 72"
            aria-invalid={Boolean(error)}
            aria-describedby="assess-help"
            autoFocus
          />
          {error && <p role="alert" className="text-error text-xs mt-xs">{error}</p>}
        </div>
        <p id="assess-help" className="text-xs text-on-surface-variant leading-relaxed">
          Below {WEAK_SCORE}% adds review → practice → retake tasks to your roadmap. {STRONG_SCORE}% or more lets TRYBE skip beginner content for this skill.
        </p>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────
// Career profile editor
// ─────────────────────────────────────────

interface Draft {
  targetRole: string;
  goal: string;
  experience: ExperienceLevel;
  industries: string;
  interests: string;
  skills: string[];
  ratings: Record<string, number>;
  weekly: number;
  style: CareerProfile['learningPreferences']['style'];
  pace: CareerProfile['learningPreferences']['pace'];
  workMode: CareerProfile['opportunityPreferences']['workMode'];
  certs: Certification[];
}

const csv = (s: string): string[] => s.split(',').map(x => x.trim()).filter(Boolean);

function canonicalList(list: string[]): string[] {
  const out: string[] = [];
  for (const raw of list) {
    const c = canonicalSkill(raw);
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { userProfile, updateUserProfile, showToast } = useApp();
  const { profile, resetCareerProfile } = useCareer();
  const [d, setD] = useState<Draft | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [certName, setCertName] = useState('');
  const [certSkills, setCertSkills] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setD({
      targetRole: profile.targetRoles[0] ?? '',
      goal: profile.careerGoals[0]?.title ?? '',
      experience: profile.experienceLevel,
      industries: profile.targetIndustries.join(', '),
      interests: profile.careerInterests.join(', '),
      skills: [...userProfile.skills],
      ratings: { ...profile.skillLevels },
      weekly: profile.weeklyLearningHours,
      style: profile.learningPreferences.style,
      pace: profile.learningPreferences.pace,
      workMode: profile.opportunityPreferences.workMode,
      certs: profile.certifications.map(c => ({ ...c })),
    });
    setConfirmReset(false);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!d) return <Modal isOpen={false} onClose={onClose}><span /></Modal>;
  const set = (patch: Partial<Draft>) => setD(prev => (prev ? { ...prev, ...patch } : prev));

  const rated: string[] = canonicalList(d.skills);
  const unscored = d.skills.filter(s => !canonicalSkill(s));

  const addSkill = () => {
    const v = newSkill.trim();
    if (!v || d.skills.some(s => s.toLowerCase() === v.toLowerCase())) return;
    set({ skills: [...d.skills, canonicalSkill(v) ?? v] });
    setNewSkill('');
  };

  const addCert = () => {
    const name = certName.trim();
    if (!name) return;
    const skills: string[] = canonicalList(csv(certSkills));
    set({ certs: [...d.certs, { id: uid('cert'), name, skills }] });
    setCertName('');
    setCertSkills('');
  };

  const save = () => {
    const ratings: Record<string, number> = {};
    for (const s of rated) if (d.ratings[s] !== undefined) ratings[s] = d.ratings[s];
    const career: CareerProfile = {
      ...profile,
      targetRoles: d.targetRole ? [d.targetRole, ...profile.targetRoles.filter(r => r !== d.targetRole)] : [],
      careerGoals: d.goal.trim() ? [{ id: profile.careerGoals[0]?.id ?? 'goal-1', title: d.goal.trim() }] : [],
      experienceLevel: d.experience,
      targetIndustries: csv(d.industries),
      careerInterests: csv(d.interests),
      skillLevels: ratings,
      weeklyLearningHours: Math.max(1, Math.min(40, d.weekly || 1)),
      learningPreferences: { style: d.style, pace: d.pace },
      opportunityPreferences: { workMode: d.workMode },
      certifications: d.certs,
    };
    updateUserProfile({ skills: d.skills, career }, true);
    showToast(d.targetRole ? 'Career profile saved. Your roadmap and matches are updating.' : 'Career profile saved.');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      icon="auto_awesome"
      title="Career profile"
      subtitle="Tell TRYBE where you’re headed. Everything is stored on this device."
      footer={
        <>
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
          <button type="button" onClick={save} className={btnPrimary}>Save career profile</button>
        </>
      }
    >
      <div className="flex flex-col gap-lg">
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <div>
            <label htmlFor="cp-role" className={`${labelCls} block mb-xs`}>Target role</label>
            <select id="cp-role" className={inputCls} value={d.targetRole} onChange={e => set({ targetRole: e.target.value })}>
              <option value="">Choose a role…</option>
              {CAREER_ROLES.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="cp-goal" className={`${labelCls} block mb-xs`}>Career goal</label>
            <input id="cp-goal" className={inputCls} value={d.goal} maxLength={120} onChange={e => set({ goal: e.target.value })} placeholder="e.g. Land an AI internship by March" />
          </div>
          <div>
            <span className={`${labelCls} block mb-xs`} id="cp-exp-label">Experience level</span>
            <div role="radiogroup" aria-labelledby="cp-exp-label" className="flex gap-xs">
              {(['Beginner', 'Intermediate', 'Advanced'] as ExperienceLevel[]).map(l => (
                <button
                  key={l}
                  type="button"
                  role="radio"
                  aria-checked={d.experience === l}
                  onClick={() => set({ experience: l })}
                  className={`flex-1 px-sm py-2 rounded-lg border text-sm transition-colors cursor-pointer ${d.experience === l ? 'border-primary bg-primary-container/20 text-primary font-semibold' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="cp-hours" className={`${labelCls} block mb-xs`}>Learning time per week: <span className="text-primary">{d.weekly} h</span></label>
            <input id="cp-hours" type="range" min={1} max={30} value={d.weekly} onChange={e => set({ weekly: Number(e.target.value) })} className="w-full accent-[#ffb2b9]" />
          </div>
          <div>
            <label htmlFor="cp-ind" className={`${labelCls} block mb-xs`}>Target industries</label>
            <input id="cp-ind" className={inputCls} value={d.industries} onChange={e => set({ industries: e.target.value })} placeholder="SaaS, AI / ML, Startups" />
          </div>
          <div>
            <label htmlFor="cp-int" className={`${labelCls} block mb-xs`}>Career interests</label>
            <input id="cp-int" className={inputCls} value={d.interests} onChange={e => set({ interests: e.target.value })} placeholder="AI, Design, Open Source" />
          </div>
        </section>

        <section aria-labelledby="cp-skills-h">
          <h3 id="cp-skills-h" className={`${labelCls} mb-sm`}>Your skills (shared with your TRYBE profile)</h3>
          <div className="flex flex-wrap gap-xs mb-sm">
            {d.skills.map(s => (
              <span key={s} className="inline-flex items-center gap-1 pl-2 pr-1 py-[2px] rounded-full bg-surface-container-high border border-outline-variant text-xs text-on-surface">
                {s}
                <button type="button" aria-label={`Remove ${s}`} onClick={() => set({ skills: d.skills.filter(x => x !== s) })} className="w-4 h-4 rounded-full hover:bg-surface-bright flex items-center justify-center cursor-pointer">
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">close</span>
                </button>
              </span>
            ))}
            {d.skills.length === 0 && <p className="text-sm text-on-surface-variant">No skills yet — add a few to unlock personalised analysis.</p>}
          </div>
          <div className="flex gap-xs">
            <input
              className={inputCls}
              list="cp-skill-options"
              aria-label="Add a skill"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Add a skill, e.g. Python"
            />
            <datalist id="cp-skill-options">{allCanonicalSkills().map(s => <option key={s} value={s} />)}</datalist>
            <button type="button" onClick={addSkill} className={btnGhost} aria-label="Add skill">Add</button>
          </div>
          {unscored.length > 0 && (
            <p className="text-xs text-on-surface-variant mt-xs">Not scored by career analysis (no matching role data): {unscored.join(', ')}.</p>
          )}

          {rated.length > 0 && (
            <div className="mt-md grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {rated.map(s => {
                const v = d.ratings[s] ?? 40;
                return (
                  <div key={s}>
                    <label htmlFor={`rate-${s}`} className="flex justify-between text-sm text-on-surface mb-1">
                      <span>{s}</span>
                      <span className="text-primary font-semibold">{v}</span>
                    </label>
                    <input id={`rate-${s}`} type="range" min={0} max={100} step={5} value={v} onChange={e => set({ ratings: { ...d.ratings, [s]: Number(e.target.value) } })} className="w-full accent-[#ffb2b9]" />
                  </div>
                );
              })}
              <p className="sm:col-span-2 text-xs text-on-surface-variant">Self-ratings are a starting point. Projects, certifications, skill checks and finished roadmap tasks adjust your level automatically.</p>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-md">
          <div>
            <label htmlFor="cp-style" className={`${labelCls} block mb-xs`}>Learning style</label>
            <select id="cp-style" className={inputCls} value={d.style} onChange={e => set({ style: e.target.value as Draft['style'] })}>
              <option value="mixed">Mixed</option><option value="projects">Learn by building</option><option value="videos">Videos</option><option value="reading">Reading</option>
            </select>
          </div>
          <div>
            <label htmlFor="cp-pace" className={`${labelCls} block mb-xs`}>Pace</label>
            <select id="cp-pace" className={inputCls} value={d.pace} onChange={e => set({ pace: e.target.value as Draft['pace'] })}>
              <option value="relaxed">Relaxed</option><option value="steady">Steady</option><option value="intensive">Intensive</option>
            </select>
          </div>
          <div>
            <label htmlFor="cp-mode" className={`${labelCls} block mb-xs`}>Work mode</label>
            <select id="cp-mode" className={inputCls} value={d.workMode} onChange={e => set({ workMode: e.target.value as Draft['workMode'] })}>
              <option value="any">Remote or onsite</option><option value="remote">Remote only</option><option value="onsite">Prefer onsite</option>
            </select>
          </div>
        </section>

        <section aria-labelledby="cp-cert-h">
          <h3 id="cp-cert-h" className={`${labelCls} mb-sm`}>Certifications</h3>
          {d.certs.length === 0 && <p className="text-sm text-on-surface-variant mb-sm">No certifications added.</p>}
          <ul className="flex flex-col gap-xs mb-sm">
            {d.certs.map(c => (
              <li key={c.id} className="flex items-center justify-between gap-sm rounded-lg border border-outline-variant px-sm py-2 text-sm">
                <span className="min-w-0 truncate">{c.name}{c.skills.length > 0 && <span className="text-on-surface-variant"> — {c.skills.join(', ')}</span>}</span>
                <button type="button" aria-label={`Remove ${c.name}`} onClick={() => set({ certs: d.certs.filter(x => x.id !== c.id) })} className="text-on-surface-variant hover:text-error cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-xs">
            <input className={inputCls} aria-label="Certification name" value={certName} onChange={e => setCertName(e.target.value)} placeholder="Certification name" />
            <input className={inputCls} aria-label="Skills it covers" value={certSkills} onChange={e => setCertSkills(e.target.value)} placeholder="Skills covered, e.g. Docker, Cloud" />
            <button type="button" onClick={addCert} className={btnGhost} aria-label="Add certification">Add</button>
          </div>
        </section>

        <section className="border-t border-outline-variant/40 pt-4">
          {confirmReset ? (
            <div className="flex flex-wrap items-center gap-sm">
              <p className="text-sm text-on-surface-variant">Clear your target role, ratings and roadmap progress?</p>
              <button type="button" onClick={() => { resetCareerProfile(); onClose(); }} className="px-md py-2 rounded-lg bg-error-container text-on-error-container text-sm font-semibold cursor-pointer">Yes, clear</button>
              <button type="button" onClick={() => setConfirmReset(false)} className={btnGhost}>Keep</button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmReset(true)} className="text-sm text-on-surface-variant hover:text-error underline underline-offset-2 cursor-pointer">Clear career profile</button>
          )}
        </section>
      </div>
    </Modal>
  );
}
