import { useMemo, useState } from 'react';
import { useCareer, SELF_ID } from '../../context/CareerContext';
import { buildSnapshot } from '../../career/engine/snapshot';
import { buildMentorInsights, buildSessionPlan } from '../../career/engine/mentor';
import { MENTOR_ID } from '../../career/engine/mentees';
import { formatHours, uid } from '../../career/engine/util';
import type { MentorSession, SessionPlan, SessionSummary } from '../../career/types';
import { generateMentorInsights, generateSessionSummary } from '../../ai/mentorAssistant';
import { signatureOf } from '../../ai/aiService';
import { useAiOutcome } from '../../ai/useAiOutcome';
import { AIFailedNotice, AIThinking, Chip, Icon, PageShell, ProgressBar, SourceChip, btnGhost, btnPrimary, cardCls, inputCls, labelCls, toneFor } from '../../components/career/ui';

const today = () => new Date().toISOString().slice(0, 10);

export default function MentorDashboard() {
  const { snapshot: mySnap, mentees, opportunities, now, saveMentorSession, toggleSessionAction, addActionTask } = useCareer();
  const [selectedId, setSelectedId] = useState<string>(mentees[0]?.id ?? SELF_ID);
  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ session: MentorSession; status: 'ok' | 'unavailable' | 'failed'; source: 'ai' | 'rules' } | null>(null);

  const roster = useMemo(() => [mySnap.student, ...mentees], [mySnap.student, mentees]);
  const record = roster.find(r => r.id === selectedId) ?? roster[0];
  const isSelf = record.id === SELF_ID;
  const snap = useMemo(() => (isSelf ? mySnap : buildSnapshot(record, opportunities, now)), [isSelf, mySnap, record, opportunities, now]);
  const rosterSnaps = useMemo(() => roster.map(r => (r.id === SELF_ID ? mySnap : buildSnapshot(r, opportunities, now))), [roster, mySnap, opportunities, now]);

  const base = useMemo(() => buildMentorInsights(snap), [snap]);
  const { outcome, loading, retry } = useAiOutcome({
    enabled: true,
    signature: signatureOf('mentor', record.id, snap.analysis?.readiness, snap.progress.overall, snap.student.sessions.length, base.concerns),
    fallback: base,
    fetcher: fresh => generateMentorInsights(snap, { fresh }),
  });
  const insights = outcome.data;
  const first = record.name.split(' ')[0];

  const select = (id: string) => {
    setSelectedId(id);
    setPlan(null);
    setChecked({});
    setNotes('');
    setSaved(null);
  };

  const startNotes = () => {
    if (!plan) return;
    setNotes(plan.agenda.map(a => `• ${a.topic} (${a.minutes} min)\n`).join('') + '\nNotes:\n\nAction items:\n- ');
    document.getElementById('session-notes')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };

  const saveSession = async () => {
    if (!notes.trim() || saving) return;
    setSaving(true);
    const out = await generateSessionSummary(snap, notes);
    const s: SessionSummary = out.data;
    const session: MentorSession = {
      id: uid('session'),
      studentId: record.id,
      mentorId: MENTOR_ID,
      date: new Date(`${date}T12:00:00`).toISOString(),
      notes: notes.trim(),
      actionItems: s.actionItems.map(title => ({ id: uid('ai'), title, done: false })),
      aiSummary: s.summary,
      aiRecommendations: s,
      summarySource: out.source,
    };
    saveMentorSession(session);
    setSaved({ session, status: out.status, source: out.source });
    setNotes('');
    setSaving(false);
  };

  const addSelectedToRoadmap = () => {
    for (const a of insights.actionItems.filter(x => checked[x.id])) {
      addActionTask({ title: a.title, description: a.reason, skill: a.skill, estimatedHours: a.estimatedHours, origin: 'mentor', note: 'Agreed with your mentor.' });
    }
    setChecked({});
  };

  const history = [...record.sessions].sort((a, b) => b.date.localeCompare(a.date));
  const selectedCount = insights.actionItems.filter(a => checked[a.id]).length;

  return (
    <PageShell
      title="Mentor Desk"
      subtitle="What a mentor sees: a one-glance briefing on any student, a suggested agenda, and a place to capture the session."
    >
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-lg">
        {/* Roster */}
        <nav aria-label="Students" className="flex lg:flex-col gap-xs overflow-x-auto lg:overflow-visible scrollbar-hide pb-1">
          {roster.map((r, i) => {
            const s = rosterSnaps[i];
            const active = r.id === record.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => select(r.id)}
                aria-current={active ? 'true' : undefined}
                className={`${cardCls} text-left p-sm min-w-[200px] lg:min-w-0 flex items-center gap-sm cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-primary ${active ? 'border-primary bg-primary-container/15' : 'hover:bg-surface-container-high'}`}
              >
                <span className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center text-sm font-bold shrink-0" aria-hidden="true">{r.name[0]}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-on-surface truncate">{r.id === SELF_ID ? `${r.name} (you)` : r.name}</span>
                  <span className="block text-xs text-on-surface-variant truncate">{s.role?.title ?? 'No target role'}</span>
                </span>
                <span className="text-right shrink-0">
                  <span className="block text-sm font-bold text-primary tabular-nums">{s.analysis?.readiness ?? '–'}{s.analysis ? '%' : ''}</span>
                  {s.progress.behind && <span className="block text-[10px] text-amber-300">behind</span>}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-lg min-w-0">
          {/* Student header */}
          <section aria-label="Student overview" className={`${cardCls} p-lg grid grid-cols-1 md:grid-cols-3 gap-lg`}>
            <div>
              <p className={labelCls}>Student</p>
              <h2 className="text-xl font-bold text-on-surface">{record.name}</h2>
              <p className="text-sm text-on-surface-variant">{record.college}</p>
              {!isSelf && <p className="text-xs text-on-surface-variant mt-xs">Demo mentee — runs through the same engine as your own data.</p>}
            </div>
            <div>
              <p className={labelCls}>Career goal</p>
              <p className="text-lg font-semibold text-on-surface">{snap.role?.title ?? 'Not set'}</p>
              <p className="text-xs text-on-surface-variant">{record.career.careerGoals[0]?.title ?? ''}</p>
            </div>
            <div className="flex flex-col gap-sm">
              <div>
                <div className="flex justify-between text-sm"><span className={labelCls}>Career readiness</span><span className="font-bold text-on-surface tabular-nums">{snap.analysis ? `${snap.analysis.readiness}%` : '–'}</span></div>
                <ProgressBar value={snap.analysis?.readiness ?? 0} label="Career readiness" tone={toneFor(snap.analysis?.readiness ?? 0)} />
              </div>
              <div>
                <div className="flex justify-between text-sm"><span className={labelCls}>Roadmap progress</span><span className="font-bold text-on-surface tabular-nums">{snap.progress.overall}%</span></div>
                <ProgressBar value={snap.progress.overall} label="Roadmap progress" tone={snap.progress.behind ? 'warn' : 'primary'} />
              </div>
            </div>
          </section>

          {/* AI insights */}
          <section aria-labelledby="insights-h" className={`${cardCls} p-lg flex flex-col gap-md`}>
            <div className="flex items-center justify-between gap-sm">
              <h2 id="insights-h" className="text-sm font-bold tracking-widest text-primary flex items-center gap-1"><span aria-hidden="true">✦</span> AI STUDENT INSIGHTS</h2>
              {!loading && <SourceChip source={outcome.source} />}
            </div>
            {loading ? <AIThinking text={`TRYBE AI is analyzing ${first}'s profile...`} /> : (
              <>
                {outcome.status === 'failed' && <AIFailedNotice onRetry={retry} what="AI insights" />}
                <p className="text-sm text-on-surface leading-relaxed">{insights.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div>
                    <h3 className={`${labelCls} mb-xs`}>Strengths</h3>
                    {insights.strengths.length === 0 ? <p className="text-sm text-on-surface-variant">Not enough data yet.</p> : (
                      <ul className="flex flex-col gap-xs">{insights.strengths.map(s => <li key={s} className="text-sm text-on-surface flex gap-xs"><span className="text-emerald-300" aria-hidden="true">✓</span><span><span className="sr-only">Strength: </span>{s}</span></li>)}</ul>
                    )}
                  </div>
                  <div>
                    <h3 className={`${labelCls} mb-xs`}>Concerns</h3>
                    {insights.concerns.length === 0 ? <p className="text-sm text-on-surface-variant">Nothing flagged.</p> : (
                      <ul className="flex flex-col gap-xs">{insights.concerns.map(s => <li key={s} className="text-sm text-on-surface flex gap-xs"><span className="text-amber-300" aria-hidden="true">⚠</span><span><span className="sr-only">Concern: </span>{s}</span></li>)}</ul>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>

          {!loading && (
            <>
              <section aria-labelledby="topics-h" className={`${cardCls} p-lg`}>
                <h2 id="topics-h" className="text-sm font-bold tracking-widest text-primary flex items-center gap-1 mb-sm"><span aria-hidden="true">✦</span> AI SUGGESTED DISCUSSION</h2>
                <ol className="flex flex-col gap-xs list-decimal pl-5 marker:text-primary marker:font-semibold">
                  {insights.discussionTopics.map(t => <li key={t} className="text-sm text-on-surface leading-relaxed">{t}</li>)}
                </ol>
              </section>

              <section aria-labelledby="plan-h" className={`${cardCls} p-lg flex flex-col gap-md`}>
                <h2 id="plan-h" className={labelCls}>Next action plan</h2>
                <ul className="flex flex-col gap-xs">
                  {insights.actionItems.map(a => (
                    <li key={a.id}>
                      <label className="flex items-start gap-sm rounded-lg bg-surface-container-low px-sm py-2 cursor-pointer">
                        <input type="checkbox" className="mt-1 accent-[#ffb2b9] w-4 h-4" checked={Boolean(checked[a.id])} onChange={e => setChecked(prev => ({ ...prev, [a.id]: e.target.checked }))} />
                        <span className="min-w-0">
                          <span className="block text-sm text-on-surface font-medium">{a.title}</span>
                          <span className="block text-xs text-on-surface-variant">{a.reason} · {formatHours(a.estimatedHours)}</span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-sm">
                  <button type="button" onClick={() => setPlan(buildSessionPlan(insights))} className={btnPrimary}>Generate Session Plan</button>
                  {isSelf && <button type="button" onClick={addSelectedToRoadmap} disabled={selectedCount === 0} className={btnGhost}>Add {selectedCount > 0 ? selectedCount : 'selected'} to roadmap</button>}
                </div>

                {plan && (
                  <div className="rounded-lg border border-primary/30 bg-primary-container/10 p-md flex flex-col gap-sm" role="region" aria-label="Session plan">
                    <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-on-surface">Session plan · {plan.agenda.reduce((s, a) => s + a.minutes, 0)} min</h3><SourceChip source={outcome.source} /></div>
                    <ol className="flex flex-col gap-xs">
                      {plan.agenda.map(a => (
                        <li key={a.topic} className="flex gap-sm text-sm"><span className="w-14 shrink-0 text-primary font-semibold tabular-nums">{a.minutes} min</span><span className="text-on-surface">{a.topic}</span></li>
                      ))}
                    </ol>
                    <div>
                      <p className={`${labelCls} mb-xs`}>Goals for next session</p>
                      <ul className="list-disc pl-5 text-sm text-on-surface flex flex-col gap-1">{plan.goals.map(g => <li key={g}>{g}</li>)}</ul>
                    </div>
                    <div><button type="button" onClick={startNotes} className={btnGhost}>Start session notes</button></div>
                  </div>
                )}
              </section>
            </>
          )}

          {/* Notes */}
          <section id="session-notes" aria-labelledby="notes-h" className={`${cardCls} p-lg flex flex-col gap-md`}>
            <h2 id="notes-h" className={labelCls}>Session notes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-md">
              <div>
                <label htmlFor="session-date" className="text-xs text-on-surface-variant block mb-xs">Date</label>
                <input id="session-date" type="date" className={inputCls} value={date} max={today()} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="session-text" className="text-xs text-on-surface-variant block mb-xs">What was discussed? List agreed actions as bullets (“- Deploy the ML project”).</label>
                <textarea id="session-text" rows={6} className={`${inputCls} resize-y`} value={notes} onChange={e => setNotes(e.target.value)} placeholder={`Notes from your session with ${first}…`} />
              </div>
            </div>
            <div className="flex flex-wrap gap-sm items-center">
              <button type="button" onClick={() => void saveSession()} disabled={!notes.trim() || saving} className={btnPrimary}>{saving ? 'Saving…' : 'Save & summarize'}</button>
              {saving && <span role="status" className="text-sm text-primary"><span aria-hidden="true" className="animate-pulse">✦</span> TRYBE AI is summarising the session...</span>}
            </div>

            {saved && saved.session.studentId === record.id && (
              <div role="status" className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-md flex flex-col gap-sm">
                <div className="flex items-center justify-between gap-sm"><p className="text-sm font-semibold text-on-surface">Session saved</p><SourceChip source={saved.source} /></div>
                {saved.status === 'failed' && <AIFailedNotice what="AI session summary" />}
                <p className="text-sm text-on-surface leading-relaxed">{saved.session.aiSummary}</p>
                {saved.session.aiRecommendations && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-md text-sm">
                    {([['Action items', saved.session.aiRecommendations.actionItems], ['Concerns', saved.session.aiRecommendations.concerns], ['Next session goals', saved.session.aiRecommendations.nextSessionGoals]] as const).map(([h, list]) => (
                      <div key={h}><p className={`${labelCls} mb-xs`}>{h}</p>{list.length === 0 ? <p className="text-on-surface-variant">None captured.</p> : <ul className="list-disc pl-4 flex flex-col gap-1 text-on-surface">{list.map(x => <li key={x}>{x}</li>)}</ul>}</div>
                    ))}
                  </div>
                )}
                {isSelf && saved.session.actionItems.length > 0 && (
                  <div><button type="button" className={btnGhost} onClick={() => { for (const a of saved.session.actionItems) addActionTask({ title: a.title, description: 'Action item from your mentor session.', estimatedHours: 2, origin: 'mentor', note: 'Agreed in your mentor session.' }); }}>Add action items to my roadmap</button></div>
                )}
              </div>
            )}
          </section>

          {/* History */}
          <section aria-labelledby="hist-h" className={`${cardCls} p-lg`}>
            <h2 id="hist-h" className={`${labelCls} mb-sm`}>Previous sessions</h2>
            {history.length === 0 ? <p className="text-sm text-on-surface-variant">No sessions recorded with {first} yet.</p> : (
              <ul className="flex flex-col gap-md">
                {history.map(s => (
                  <li key={s.id} className="rounded-lg bg-surface-container-low p-md flex flex-col gap-xs">
                    <div className="flex items-center justify-between gap-sm"><p className="text-sm font-semibold text-on-surface"><Icon name="event" className="text-[16px] align-middle mr-1" />{new Date(s.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>{s.summarySource && <SourceChip source={s.summarySource} />}</div>
                    <p className="text-sm text-on-surface-variant whitespace-pre-line">{s.aiSummary ?? s.notes}</p>
                    {s.actionItems.length > 0 && (
                      <ul className="flex flex-col gap-1 mt-xs">
                        {s.actionItems.map(a => (
                          <li key={a.id}>
                            <label className="flex items-center gap-sm text-sm cursor-pointer">
                              <input type="checkbox" className="accent-[#ffb2b9] w-4 h-4" checked={a.done} onChange={e => toggleSessionAction(a.id, e.target.checked)} />
                              <span className={a.done ? 'line-through text-on-surface-variant' : 'text-on-surface'}>{a.title}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                    {s.actionItems.length > 0 && !isSelf && <Chip>{s.actionItems.filter(a => a.done).length}/{s.actionItems.length} done</Chip>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}
