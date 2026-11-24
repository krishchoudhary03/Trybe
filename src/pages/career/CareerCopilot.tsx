import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCareer } from '../../context/CareerContext';
import { generateCareerRecommendation } from '../../ai/careerCopilot';
import { SUGGESTED_QUESTIONS } from '../../career/engine/copilotLocal';
import { weeklyPlan } from '../../career/engine/roadmap';
import { formatHours, daysBetween, uid } from '../../career/engine/util';
import type { CopilotMessage } from '../../career/types';
import { useCareerModals } from '../../components/career/CareerModals';
import { NextBestActionCard, useRunAction } from '../../components/career/NextBestActionCard';
import {
  AIFailedNotice, AIThinking, Chip, EmptyState, ImpactPill, PageShell, ProgressBar, SourceChip,
  btnGhost, btnPrimary, cardCls, inputCls, labelCls, toneFor,
} from '../../components/career/ui';

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function CareerCopilot() {
  const { snapshot, student, copilotThread, appendCopilot, updateCopilot, clearCopilot, opportunities, sessions, now } = useCareer();
  const { openProfile } = useCareerModals();
  const run = useRunAction();
  const [draft, setDraft] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { analysis, role, progress, completeness } = snapshot;
  const first = student.name.split(' ')[0];

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }, [copilotThread.length, busyId]);

  if (!completeness.complete || !role || !analysis) {
    return (
      <PageShell title="Career Copilot" subtitle="Your personalised guide to what to do next.">
        <EmptyState
          icon="auto_awesome"
          title={completeness.missing.includes('a target role') ? 'Choose a target role to generate your personalized roadmap' : 'Your career profile is incomplete'}
          body="Add your target career and skills to unlock personalised recommendations, your readiness score, a learning roadmap and matched opportunities."
          action={<button type="button" onClick={openProfile} className={btnPrimary}>Complete Career Profile</button>}
        />
      </PageShell>
    );
  }

  const ask = async (text: string, retryId?: string) => {
    const q = text.trim();
    if (!q || busyId) return;
    const pendingId = retryId ?? uid('msg');
    if (!retryId) {
      appendCopilot({ id: uid('msg'), role: 'user', text: q, at: new Date().toISOString() });
      setDraft('');
    }
    setBusyId(pendingId);
    const outcome = await generateCareerRecommendation(snapshot, q, {
      fresh: Boolean(retryId),
      thread: copilotThread,
    });
    const msg: CopilotMessage = {
      id: pendingId,
      role: 'assistant',
      text: outcome.data.answer,
      response: outcome.data,
      source: outcome.source,
      failed: outcome.status === 'failed',
      at: new Date().toISOString(),
    };
    if (retryId) updateCopilot(pendingId, msg);
    else appendCopilot(msg);
    setBusyId(null);
  };

  const questionFor = (id: string): string => {
    const i = copilotThread.findIndex(m => m.id === id);
    for (let j = i - 1; j >= 0; j--) if (copilotThread[j].role === 'user') return copilotThread[j].text;
    return 'What should I do next?';
  };

  const plan = weeklyPlan(student.roadmap, student.career.weeklyLearningHours, now);
  const matches = snapshot.opportunities.filter(o => !o.expired && student.opportunityStatus[o.opportunity.id] !== 'dismissed').slice(0, 3);
  const lastSession = [...sessions.filter(s => s.studentId === student.id)].sort((a, b) => b.date.localeCompare(a.date))[0];
  const openItems = lastSession?.actionItems.filter(a => !a.done).length ?? 0;
  const oppById = new Map(opportunities.map(o => [o.id, o]));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void ask(draft);
  };

  return (
    <PageShell
      title="Career Copilot"
      subtitle="Know where you stand, and exactly what to do next to move closer to your career goal."
      actions={<button type="button" onClick={openProfile} className={btnGhost}>Edit career profile</button>}
    >
      <div className="flex flex-col gap-lg">
        {/* Hero */}
        <section aria-label="Career summary" className={`${cardCls} p-lg grid grid-cols-1 md:grid-cols-[1fr_auto] gap-lg items-center`}>
          <div>
            <p className="text-lg font-semibold text-on-surface">{greeting()}, {first}</p>
            <p className={`${labelCls} mt-md`}>Target career</p>
            <p className="text-2xl font-bold text-on-surface">{role.title}</p>
            {student.career.careerGoals[0] && <p className="text-sm text-on-surface-variant mt-xs">Goal: {student.career.careerGoals[0].title}</p>}
          </div>
          <div className="md:w-72">
            <div className="flex items-baseline justify-between mb-xs">
              <span className={labelCls}>Career readiness</span>
              <span className="text-2xl font-bold text-on-surface">{analysis.readiness}%</span>
            </div>
            <ProgressBar value={analysis.readiness} label="Career readiness" tone={toneFor(analysis.readiness)} size="lg" />
            <div className="flex items-center justify-between mt-sm text-xs text-on-surface-variant">
              <span>Roadmap {progress.overall}% complete</span>
              <Link to="/career/readiness" className="text-primary hover:underline">See breakdown →</Link>
            </div>
          </div>
        </section>

        {student.projects.length === 0 && (
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 px-md py-sm text-sm text-on-surface-variant flex flex-wrap items-center gap-sm justify-between">
            <span>You haven’t added any projects yet. Adding projects will improve your career readiness analysis.</span>
            <Link to="/work" className="text-primary font-semibold hover:underline">Add a project →</Link>
          </div>
        )}

        <NextBestActionCard />

        {snapshot.alternatives.length > 0 && (
          <section aria-label="Other recommended actions" className={`${cardCls} p-md`}>
            <h2 className={`${labelCls} mb-sm`}>Then, consider</h2>
            <ul className="flex flex-col divide-y divide-outline-variant/50">
              {snapshot.alternatives.slice(0, 3).map(a => (
                <li key={a.id} className="py-sm flex flex-col sm:flex-row sm:items-center gap-sm justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface">{a.title}</p>
                    <p className="text-xs text-on-surface-variant line-clamp-2">{a.reason}</p>
                  </div>
                  <div className="flex items-center gap-sm shrink-0">
                    <span className="text-xs text-on-surface-variant">{formatHours(a.estimatedHours)}</span>
                    <button type="button" onClick={() => run(a)} className={btnGhost}>{a.ctaLabel}</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <section aria-labelledby="week-h" className={`${cardCls} p-md flex flex-col gap-sm`}>
            <div className="flex items-center justify-between">
              <h2 id="week-h" className={labelCls}>This week · {student.career.weeklyLearningHours} h available</h2>
              <Link to="/career/roadmap" className="text-xs text-primary hover:underline">Roadmap →</Link>
            </div>
            {plan.items.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No open roadmap tasks. Nice work — pick a new project or opportunity.</p>
            ) : (
              <ul className="flex flex-col gap-xs">
                {plan.items.map(({ task }) => {
                  const overdue = task.dueAt && daysBetween(task.dueAt, now) >= 1;
                  return (
                    <li key={task.id} className="flex items-start justify-between gap-sm rounded-lg bg-surface-container-low px-sm py-2">
                      <div className="min-w-0">
                        <p className="text-sm text-on-surface">{task.title}</p>
                        <p className="text-xs text-on-surface-variant">{task.skill || 'Action plan'} · {formatHours(task.estimatedHours)}</p>
                      </div>
                      {overdue && <Chip tone="bad">Overdue</Chip>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="matches-h" className={`${cardCls} p-md flex flex-col gap-sm`}>
            <div className="flex items-center justify-between">
              <h2 id="matches-h" className={labelCls}>Top matches for you</h2>
              <Link to="/career/opportunities" className="text-xs text-primary hover:underline">All opportunities →</Link>
            </div>
            {matches.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No open opportunities right now.</p>
            ) : (
              <ul className="flex flex-col gap-xs">
                {matches.map(m => (
                  <li key={m.opportunity.id}>
                    <Link to={`/career/opportunities?open=${encodeURIComponent(m.opportunity.id)}`} className="flex items-center justify-between gap-sm rounded-lg bg-surface-container-low px-sm py-2 hover:bg-surface-container-high transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm text-on-surface truncate">{m.opportunity.title}</p>
                        <p className="text-xs text-on-surface-variant truncate">{m.opportunity.organization}{m.missing.length ? ` · missing ${m.missing[0]}` : ''}</p>
                      </div>
                      <span className="text-sm font-bold text-primary shrink-0">{m.score}%</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {lastSession && (
          <section aria-label="Latest mentor session" className={`${cardCls} p-md flex flex-wrap items-center justify-between gap-sm`}>
            <div>
              <h2 className={labelCls}>Latest mentor session</h2>
              <p className="text-sm text-on-surface mt-xs">{new Date(lastSession.date).toLocaleDateString()} — {openItems > 0 ? `${openItems} action item${openItems > 1 ? 's' : ''} still open` : 'all action items done'}</p>
              {lastSession.aiSummary && <p className="text-xs text-on-surface-variant mt-xs max-w-2xl">{lastSession.aiSummary}</p>}
            </div>
            <Link to="/career/mentor" className={btnGhost}>Open Mentor Desk</Link>
          </section>
        )}

        {/* Ask */}
        <section aria-labelledby="ask-h" className={`${cardCls} p-lg flex flex-col gap-md`}>
          <div className="flex items-center justify-between gap-sm">
            <h2 id="ask-h" className="text-sm font-bold tracking-widest text-primary flex items-center gap-1"><span aria-hidden="true">✦</span> ASK CAREER COPILOT</h2>
            {copilotThread.length > 0 && (
              <button type="button" onClick={clearCopilot} className="text-xs text-on-surface-variant hover:text-on-surface underline underline-offset-2 cursor-pointer">Clear conversation</button>
            )}
          </div>

          {copilotThread.length === 0 && (
            <ul className="flex flex-wrap gap-xs" aria-label="Suggested questions">
              {SUGGESTED_QUESTIONS.map(q => (
                <li key={q}>
                  <button type="button" onClick={() => void ask(q)} disabled={Boolean(busyId)} className="px-sm py-1.5 rounded-full border border-outline-variant text-xs text-on-surface-variant hover:text-primary hover:border-primary transition-colors cursor-pointer disabled:opacity-50">
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-md" aria-live="polite">
            {copilotThread.map(m =>
              m.role === 'user' ? (
                <div key={m.id} className="self-end max-w-[85%] rounded-2xl rounded-br-sm bg-primary-container/30 text-on-surface px-md py-sm text-sm">{m.text}</div>
              ) : (
                <article key={m.id} className="self-start w-full max-w-[95%] rounded-2xl rounded-bl-sm bg-surface-container-low border border-outline-variant px-md py-md flex flex-col gap-sm">
                  <div className="flex items-center gap-sm"><SourceChip source={m.source ?? 'rules'} /></div>
                  {m.failed && <AIFailedNotice onRetry={() => void ask(questionFor(m.id), m.id)} />}
                  <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">{m.text}</p>
                  {m.response?.nextBestAction && (
                    <div className="rounded-lg border border-outline-variant bg-surface px-sm py-2 flex flex-col gap-1">
                      <p className={labelCls}>Next best action</p>
                      <p className="text-sm font-semibold text-on-surface">{m.response.nextBestAction}</p>
                      {m.response.reason && <p className="text-xs text-on-surface-variant">{m.response.reason}</p>}
                      <div className="flex flex-wrap items-center gap-xs mt-1">
                        <ImpactPill impact={m.response.priority} />
                        {m.response.skill && <Chip tone="primary">{m.response.skill}</Chip>}
                        {m.response.estimatedHours && <Chip>{formatHours(m.response.estimatedHours)}</Chip>}
                      </div>
                    </div>
                  )}
                  {m.response?.opportunityIds && (
                    <ul className="flex flex-col gap-xs">
                      {m.response.opportunityIds.map(id => oppById.get(id)).filter(Boolean).map(o => (
                        <li key={o!.id}><Link className="text-sm text-primary hover:underline" to={`/career/opportunities?open=${encodeURIComponent(o!.id)}`}>{o!.title} · {o!.organization} →</Link></li>
                      ))}
                    </ul>
                  )}
                </article>
              ),
            )}
            {busyId && !copilotThread.some(m => m.id === busyId) && (
              <div className="self-start w-full max-w-[95%] rounded-2xl bg-surface-container-low border border-outline-variant px-md py-md"><AIThinking /></div>
            )}
            {busyId && copilotThread.some(m => m.id === busyId) && (
              <div className="self-start w-full max-w-[95%] rounded-2xl bg-surface-container-low border border-outline-variant px-md py-md"><AIThinking text="TRYBE AI is trying again..." /></div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={submit} className="flex gap-xs">
            <label htmlFor="copilot-input" className="sr-only">Ask Career Copilot a question</label>
            <input
              id="copilot-input"
              className={inputCls}
              value={draft}
              maxLength={300}
              onChange={e => setDraft(e.target.value)}
              placeholder="What should I learn this week?"
              disabled={Boolean(busyId)}
              autoComplete="off"
            />
            <button type="submit" className={btnPrimary} disabled={!draft.trim() || Boolean(busyId)} aria-label="Send question">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">send</span>
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </section>
      </div>
    </PageShell>
  );
}
