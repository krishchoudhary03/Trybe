import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCareer } from '../../context/CareerContext';
import { phaseProgress, ACTION_PHASE_ID } from '../../career/engine/roadmap';
import { daysBetween, formatHours } from '../../career/engine/util';
import { latestAssessments } from '../../career/engine/skills';
import type { AdaptationEvent, PhaseStatus, RoadmapTask, TaskTier } from '../../career/types';
import { generateRoadmapNotes, roadmapNotesLocally } from '../../ai/roadmapGenerator';
import { signatureOf } from '../../ai/aiService';
import { useAiOutcome } from '../../ai/useAiOutcome';
import { useCareerModals } from '../../components/career/CareerModals';
import { NextBestActionCard } from '../../components/career/NextBestActionCard';
import {
  AIFailedNotice, Chip, EmptyState, Icon, PageShell, ProgressBar, btnGhost, btnPrimary, cardCls, labelCls, toneFor,
} from '../../components/career/ui';

const TIER_LABEL: Record<TaskTier, string> = {
  foundation: 'Foundation', core: 'Core', project: 'Project', assessment: 'Skill check',
  review: 'Review', practice: 'Practice', retake: 'Retake', action: 'Action',
};

const STATUS_LABEL: Record<PhaseStatus, { label: string; tone: 'good' | 'primary' | 'neutral' | 'warn' }> = {
  completed: { label: 'Completed', tone: 'good' },
  proficient: { label: 'Already proficient', tone: 'good' },
  in_progress: { label: 'In progress', tone: 'primary' },
  upcoming: { label: 'Upcoming', tone: 'neutral' },
};

const EVENT_ICON: Record<AdaptationEvent['kind'], string> = {
  weak_assessment: 'trending_down', strong_assessment: 'trending_up', role_changed: 'swap_horiz',
  rebalanced: 'event_repeat', regenerated: 'refresh',
};

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function CareerRoadmap() {
  const { snapshot, student, now, setTaskDone, rebalanceRoadmap, regenerateRoadmap } = useCareer();
  const { openProfile, openAssessment } = useCareerModals();
  const location = useLocation();
  const { role, progress } = snapshot;
  const roadmap = student.roadmap;
  const targetId = location.hash.startsWith('#task-') ? location.hash.slice(1) : '';
  const [highlight, setHighlight] = useState('');

  const defaultCollapsed = useMemo(() => {
    const set = new Set<string>();
    for (const p of roadmap?.phases ?? []) {
      const hasTarget = targetId && p.tasks.some(t => `task-${t.id}` === targetId);
      if ((p.status === 'completed' || p.status === 'proficient') && !hasTarget) set.add(p.id);
    }
    return set;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [collapsed, setCollapsed] = useState<Set<string>>(defaultCollapsed);

  // Deep-link from "Next best action": scroll to and flash the task.
  useEffect(() => {
    if (!targetId) return;
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    setHighlight(targetId);
    const t = setTimeout(() => setHighlight(''), 2500);
    return () => clearTimeout(t);
  }, [targetId, roadmap?.updatedAt]);

  const sig = signatureOf('roadmap', roadmap?.roleId, roadmap?.phases.map(p => [p.id, p.status, p.tasks.length]), roadmap?.adaptations.length);
  const { outcome: notesOutcome, loading: notesLoading, retry } = useAiOutcome({
    enabled: Boolean(roadmap && role),
    signature: sig,
    fallback: roadmapNotesLocally(snapshot),
    fetcher: fresh => generateRoadmapNotes(snapshot, { fresh }),
  });
  const notes = notesOutcome.data;

  if (!role || !roadmap) {
    return (
      <PageShell title="My Roadmap" subtitle="A learning plan that adapts to your results.">
        <EmptyState
          icon="route"
          title="Choose a target role to generate your personalized roadmap"
          body="Your roadmap is built from your target role, your current skills and how much time you have each week."
          action={<button type="button" onClick={openProfile} className={btnPrimary}>Complete Career Profile</button>}
        />
      </PageShell>
    );
  }

  const toggle = (t: RoadmapTask) => {
    if (t.status === 'completed') return setTaskDone(t.id, false);
    if (t.tier === 'assessment' || t.tier === 'retake') return openAssessment({ skill: t.skill, taskId: t.id });
    setTaskDone(t.id, true);
  };

  const toggleCollapse = (id: string) =>
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const events = [...roadmap.adaptations].reverse().slice(0, 4);
  const checks = Object.values(latestAssessments(student.assessments)).sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  const phases = [...roadmap.phases].sort((a, b) => (a.id === ACTION_PHASE_ID ? -1 : b.id === ACTION_PHASE_ID ? 1 : 0));

  const renderTask = (t: RoadmapTask) => {
    const done = t.status === 'completed';
    const overdue = t.status === 'todo' && t.dueAt && daysBetween(t.dueAt, now) >= 1;
    return (
      <li
        key={t.id}
        id={`task-${t.id}`}
        className={`flex items-start gap-sm rounded-lg px-sm py-sm transition-colors ${highlight === `task-${t.id}` ? 'bg-primary-container/25 ring-1 ring-primary' : 'bg-surface-container-low'}`}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={`${done ? 'Mark not done' : 'Mark done'}: ${t.title}`}
          onClick={() => toggle(t)}
          className={`mt-[2px] w-5 h-5 shrink-0 rounded border flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-primary ${done ? 'bg-primary border-primary text-on-primary' : 'border-outline hover:border-primary'}`}
        >
          {done && <Icon name="check" className="text-[16px]" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${done ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>{t.title}</p>
          <p className="text-xs text-on-surface-variant mt-[2px] leading-relaxed">{t.description}</p>
          <div className="flex flex-wrap items-center gap-xs mt-xs">
            <Chip>{TIER_LABEL[t.tier]}</Chip>
            {t.skill && <Chip tone="primary">{t.skill}</Chip>}
            <Chip>{formatHours(t.estimatedHours)}</Chip>
            {t.skillGain > 0 && !done && <Chip tone="good">+{t.skillGain} {t.skill || 'skill'}</Chip>}
            {t.origin === 'adaptive' && <Chip tone="warn">✦ Adapted for you</Chip>}
            {t.origin === 'gap' && <Chip tone="primary">From skill gap</Chip>}
            {t.origin === 'mentor' && <Chip tone="primary">From mentor</Chip>}
            {t.status === 'todo' && t.dueAt && (overdue ? <Chip tone="bad">Overdue · was {fmt(t.dueAt)}</Chip> : <Chip>Due {fmt(t.dueAt)}</Chip>)}
            {done && t.completedAt && <Chip tone="good">Done {fmt(t.completedAt)}</Chip>}
          </div>
          {t.note && t.origin !== 'template' && <p className="text-xs text-on-surface-variant mt-xs italic">{t.note}</p>}
        </div>
      </li>
    );
  };

  return (
    <PageShell
      title="My Roadmap"
      subtitle={`A ${role.title} plan that adapts to your skills, results and pace.`}
      actions={
        <>
          <button type="button" onClick={() => openAssessment()} className={btnGhost}>Log a skill check</button>
          <button type="button" onClick={regenerateRoadmap} className={btnGhost}><Icon name="refresh" className="text-[18px]" /> Refresh plan</button>
        </>
      }
    >
      <div className="flex flex-col gap-lg">
        <section aria-label="Roadmap summary" className={`${cardCls} p-lg grid grid-cols-1 md:grid-cols-[1fr_auto] gap-lg items-center`}>
          <div>
            <p className={labelCls}>{roadmap.targetRole} roadmap</p>
            <div className="flex items-baseline gap-sm mt-xs">
              <p className="text-4xl font-bold text-on-surface tabular-nums">{progress.overall}%</p>
              <p className="text-sm text-on-surface-variant">complete · {progress.completedTasks} of {progress.activeTasks} tasks</p>
            </div>
            <div className="mt-sm"><ProgressBar value={progress.overall} label="Overall roadmap progress" tone={toneFor(progress.overall)} size="lg" /></div>
          </div>
          <ul className="text-sm text-on-surface-variant flex flex-col gap-1">
            <li><Icon name="schedule" className="text-[16px] align-middle mr-1" />{student.career.weeklyLearningHours} h / week</li>
            <li><Icon name="fast_forward" className="text-[16px] align-middle mr-1" />{progress.skippedTasks} tasks skipped (already covered)</li>
          </ul>
        </section>

        {progress.behind && (
          <div role="status" className="rounded-lg border border-amber-400/30 bg-amber-400/5 px-md py-sm flex flex-wrap gap-sm items-center justify-between">
            <p className="text-sm text-on-surface-variant">You’re behind schedule: {progress.overdueTasks.length} tasks are overdue. Rebalance the plan around your {student.career.weeklyLearningHours} weekly hours.</p>
            <button type="button" onClick={rebalanceRoadmap} className={btnPrimary}>Rebalance schedule</button>
          </div>
        )}

        <NextBestActionCard variant="compact" />

        {events.length > 0 && (
          <section aria-labelledby="adapt-h" className={`${cardCls} p-md`}>
            <h2 id="adapt-h" className="text-xs font-bold tracking-widest text-primary flex items-center gap-1 mb-sm"><span aria-hidden="true">✦</span> HOW YOUR ROADMAP ADAPTED</h2>
            <ul className="flex flex-col gap-sm">
              {events.map(e => (
                <li key={e.id} className="flex items-start gap-sm text-sm text-on-surface">
                  <Icon name={EVENT_ICON[e.kind]} className="text-[18px] text-primary mt-[1px]" />
                  <span>{e.message} <span className="text-on-surface-variant text-xs">· {fmt(e.at)}</span></span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {notesLoading && <p role="status" className="text-sm text-primary"><span aria-hidden="true" className="animate-pulse">✦</span> TRYBE AI is personalising your phase notes...</p>}
        {notesOutcome.status === 'failed' && <AIFailedNotice onRetry={retry} what="AI phase notes" />}

        <ol className="flex flex-col gap-md">
          {phases.map((p, idx) => {
            const pct = phaseProgress(p);
            const open = !collapsed.has(p.id);
            const st = STATUS_LABEL[p.status];
            const active = p.tasks.filter(t => t.status !== 'skipped');
            const skipped = p.tasks.filter(t => t.status === 'skipped');
            return (
              <li key={p.id} id={p.id} className={`${cardCls} p-md`}>
                <button
                  type="button"
                  onClick={() => toggleCollapse(p.id)}
                  aria-expanded={open}
                  aria-controls={`${p.id}-tasks`}
                  className="w-full text-left flex flex-col gap-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-primary rounded"
                >
                  <div className="flex flex-wrap items-center justify-between gap-sm">
                    <h2 className="text-base font-bold text-on-surface">{p.id === ACTION_PHASE_ID ? p.title : `Phase ${idx + (phases[0]?.id === ACTION_PHASE_ID ? 0 : 1)} — ${p.title}`}</h2>
                    <div className="flex items-center gap-sm">
                      <Chip tone={st.tone}>{st.label}</Chip>
                      <span className="text-sm font-semibold text-on-surface tabular-nums">{pct}%</span>
                      <Icon name={open ? 'expand_less' : 'expand_more'} className="text-on-surface-variant" />
                    </div>
                  </div>
                  <ProgressBar value={pct} label={`${p.title} progress`} tone={p.status === 'completed' || p.status === 'proficient' ? 'good' : 'primary'} size="sm" />
                  <p className="text-xs text-on-surface-variant">{p.description}{p.estimatedHours > 0 && ` · ${formatHours(p.estimatedHours)} planned`}</p>
                </button>
                {notes[p.id] && <p className="text-xs text-primary mt-sm flex gap-1"><span aria-hidden="true">✦</span><span className="text-on-surface-variant">{notes[p.id]}</span></p>}

                {open && (
                  <div id={`${p.id}-tasks`} className="mt-md flex flex-col gap-sm">
                    {active.length === 0 ? (
                      <p className="text-sm text-on-surface-variant">Nothing to do here — you already meet the target for this phase.</p>
                    ) : (
                      <ul className="flex flex-col gap-xs">{active.map(renderTask)}</ul>
                    )}
                    {skipped.length > 0 && (
                      <details className="text-xs text-on-surface-variant">
                        <summary className="cursor-pointer hover:text-on-surface">{skipped.length} skipped task{skipped.length > 1 ? 's' : ''} — why?</summary>
                        <ul className="mt-xs flex flex-col gap-1 pl-4 list-disc">
                          {skipped.map(t => <li key={t.id} id={`task-${t.id}`}><span className="line-through">{t.title}</span> — {t.note}</li>)}
                        </ul>
                      </details>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {checks.length > 0 && (
          <section aria-labelledby="checks-h" className={`${cardCls} p-md`}>
            <h2 id="checks-h" className={`${labelCls} mb-sm`}>Your skill checks</h2>
            <ul className="flex flex-wrap gap-sm">
              {checks.map(c => (
                <li key={c.id}><Chip tone={c.score < 60 ? 'bad' : c.score >= 85 ? 'good' : 'neutral'}>{c.skill}: {c.score}% · {fmt(c.takenAt)}</Chip></li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </PageShell>
  );
}
