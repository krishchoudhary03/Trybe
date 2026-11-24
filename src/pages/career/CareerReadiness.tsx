import { useState } from 'react';
import { useCareer } from '../../context/CareerContext';
import { CAREER_ROLES } from '../../career/data/roles';
import { isGapActionAdded } from '../../career/engine/roadmap';
import { formatHours } from '../../career/engine/util';
import type { SkillGapItem } from '../../career/types';
import { explainSkillGap, explainSkillGapLocally } from '../../ai/skillGapAnalyzer';
import { signatureOf } from '../../ai/aiService';
import { useAiOutcome } from '../../ai/useAiOutcome';
import { useCareerModals } from '../../components/career/CareerModals';
import {
  AIFailedNotice, AIThinking, EmptyState, PageShell, ProgressBar, SourceChip, StatusPill,
  btnGhost, btnPrimary, cardCls, labelCls, toneFor,
} from '../../components/career/ui';

function skillRow(item: SkillGapItem) {
  return (
    <li key={item.skill} className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-sm text-sm">
        <span className="text-on-surface font-medium">{item.skill}</span>
        <span className="text-on-surface-variant tabular-nums">{item.level} / {item.target}</span>
      </div>
      <ProgressBar value={item.coverage * 100} label={`${item.skill}: ${item.level} of ${item.target}`} tone={item.status === 'strong' ? 'good' : item.status === 'critical' ? 'bad' : 'warn'} size="sm" />
    </li>
  );
}

export default function CareerReadiness() {
  const { snapshot, student, profile, setTargetRole, addGapToRoadmap } = useCareer();
  const { openProfile, openAssessment } = useCareerModals();
  const [showAll, setShowAll] = useState(false);
  const { analysis, role } = snapshot;

  const local = explainSkillGapLocally(snapshot);
  const sig = signatureOf('gap', role?.id, analysis?.readiness, analysis?.items.map(i => [i.skill, i.level]));
  const { outcome, loading, retry } = useAiOutcome({
    enabled: Boolean(analysis),
    signature: sig,
    fallback: local,
    fetcher: async fresh => {
      const o = await explainSkillGap(snapshot, { fresh });
      return o;
    },
  });
  const explanation = outcome.data;

  const roleSelector = (
    <section aria-labelledby="role-h" className={`${cardCls} p-md mb-lg`}>
      <h2 id="role-h" className={`${labelCls} mb-sm`}>Target role</h2>
      <div role="group" aria-label="Choose a target role" className="flex flex-wrap gap-xs">
        {CAREER_ROLES.map(r => {
          const active = profile.targetRoles[0] === r.id;
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={active}
              onClick={() => !active && setTargetRole(r.id)}
              className={`px-md py-2 rounded-full border text-sm transition-colors cursor-pointer ${active ? 'border-primary bg-primary-container/25 text-primary font-semibold' : 'border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}
            >
              {r.title}
            </button>
          );
        })}
      </div>
      {role && <p className="text-sm text-on-surface-variant mt-sm">{role.summary}</p>}
    </section>
  );

  if (!role || !analysis) {
    return (
      <PageShell title="Career Readiness" subtitle="See how your skills compare with what your target role needs.">
        {roleSelector}
        <EmptyState icon="query_stats" title="Choose a target role to see your readiness" body="Pick a role above. TRYBE compares your skills with what that role requires and tells you exactly what to work on." />
      </PageShell>
    );
  }

  const gaps = analysis.items.filter(i => i.gap > 0);
  const visible = showAll ? gaps : gaps.slice(0, 4);

  return (
    <PageShell
      title="Career Readiness"
      subtitle="A transparent score built from your skills, proof of work and progress — and what to do about every gap."
      actions={
        <>
          <button type="button" onClick={() => openAssessment()} className={btnGhost}>Log a skill check</button>
          <button type="button" onClick={openProfile} className={btnGhost}>Edit skills</button>
        </>
      }
    >
      {roleSelector}

      {!snapshot.completeness.complete && (
        <div className="mb-lg rounded-lg border border-amber-400/30 bg-amber-400/5 px-md py-sm text-sm text-on-surface-variant flex flex-wrap gap-sm items-center justify-between">
          <span>Your career profile is incomplete. Add {snapshot.completeness.missing.join(' and ')} to unlock more accurate results.</span>
          <button type="button" onClick={openProfile} className={btnGhost}>Complete Career Profile</button>
        </div>
      )}

      <div className="flex flex-col gap-lg">
        {/* Score */}
        <section aria-labelledby="score-h" className={`${cardCls} p-lg grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-lg`}>
          <div>
            <h2 id="score-h" className={labelCls}>Career readiness · {analysis.roleTitle}</h2>
            <p className="text-5xl font-bold text-on-surface mt-sm tabular-nums">{analysis.readiness}%</p>
            <div className="mt-sm"><ProgressBar value={analysis.readiness} label="Career readiness" tone={toneFor(analysis.readiness)} size="lg" /></div>
            <p className="text-xs text-on-surface-variant mt-sm">Calculated by TRYBE from your data — the AI explains the score but never sets it.</p>
          </div>
          <ul className="flex flex-col gap-md">
            {analysis.breakdown.map(b => (
              <li key={b.key}>
                <div className="flex items-baseline justify-between gap-sm text-sm">
                  <span className="text-on-surface font-medium">{b.label} <span className="text-on-surface-variant font-normal">· {b.weightPct}% of score</span></span>
                  <span className="text-on-surface tabular-nums font-semibold">{b.scorePct}%</span>
                </div>
                <ProgressBar value={b.scorePct} label={b.label} tone={toneFor(b.scorePct)} size="sm" />
                <p className="text-xs text-on-surface-variant mt-1">{b.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* AI explanation */}
        <section aria-labelledby="explain-h" className={`${cardCls} p-lg flex flex-col gap-md`}>
          <div className="flex items-center justify-between gap-sm">
            <h2 id="explain-h" className="text-sm font-bold tracking-widest text-primary flex items-center gap-1"><span aria-hidden="true">✦</span> WHY THIS SCORE</h2>
            {!loading && explanation && <SourceChip source={outcome.source} />}
          </div>
          {loading ? (
            <AIThinking />
          ) : (
            explanation && (
              <>
                {outcome.status === 'failed' && <AIFailedNotice onRetry={retry} what="AI explanation" />}
                <p className="text-sm text-on-surface leading-relaxed">{explanation.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  {([['Strengths', explanation.strengths], ['Biggest gaps', explanation.gaps], ['Recommended actions', explanation.recommendations]] as const).map(([h, list]) => (
                    <div key={h}>
                      <h3 className={`${labelCls} mb-xs`}>{h}</h3>
                      {list.length === 0 ? <p className="text-sm text-on-surface-variant">—</p> : (
                        <ul className="flex flex-col gap-xs list-disc pl-4 marker:text-primary">
                          {list.map(x => <li key={x} className="text-sm text-on-surface leading-relaxed">{x}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </section>

        {/* Classified skills */}
        <section aria-label="Skill classification" className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {([
            ['strong', 'Strong skills', analysis.strengths],
            ['needs_improvement', 'Needs improvement', analysis.needsImprovement],
            ['critical', 'Critical gaps', analysis.critical],
          ] as const).map(([status, title, list]) => (
            <div key={status} className={`${cardCls} p-md flex flex-col gap-sm`}>
              <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-on-surface">{title}</h2><StatusPill status={status} /></div>
              {list.length === 0 ? <p className="text-sm text-on-surface-variant">None right now.</p> : <ul className="flex flex-col gap-sm">{list.map(skillRow)}</ul>}
            </div>
          ))}
        </section>

        {/* Gap → action */}
        <section aria-labelledby="gaps-h" className="flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <h2 id="gaps-h" className="text-lg font-bold text-on-surface">Skill gaps → actions</h2>
            {gaps.length > 4 && <button type="button" onClick={() => setShowAll(v => !v)} className="text-sm text-primary hover:underline cursor-pointer">{showAll ? 'Show top 4' : `Show all ${gaps.length}`}</button>}
          </div>
          {gaps.length === 0 ? (
            <p className="text-sm text-on-surface-variant">You’re at target on every required skill. Focus on projects and applications.</p>
          ) : (
            visible.map(g => {
              const added = isGapActionAdded(student.roadmap, g.skill);
              return (
                <article key={g.skill} className={`${cardCls} p-lg flex flex-col gap-md`}>
                  <div className="flex flex-wrap items-center justify-between gap-sm">
                    <div className="flex items-center gap-sm"><p className={labelCls}>Skill gap</p><h3 className="text-lg font-bold text-on-surface">{g.skill}</h3></div>
                    <StatusPill status={g.status} />
                  </div>
                  <dl className="grid grid-cols-3 gap-md text-sm">
                    <div><dt className={labelCls}>Current</dt><dd className="text-on-surface font-semibold text-lg tabular-nums">{g.level}%</dd></div>
                    <div><dt className={labelCls}>Target</dt><dd className="text-on-surface font-semibold text-lg tabular-nums">{g.target}%</dd></div>
                    <div><dt className={labelCls}>Gap</dt><dd className="text-primary font-semibold text-lg tabular-nums">{g.gap} points</dd></div>
                  </dl>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
                    <div><p className={labelCls}>Why it matters</p><p className="text-on-surface mt-xs leading-relaxed">{g.whyItMatters}</p></div>
                    <div>
                      <p className={labelCls}>Recommended action</p>
                      <p className="text-on-surface font-semibold mt-xs">{g.action.title}</p>
                      <p className="text-on-surface-variant mt-xs leading-relaxed">{g.action.how}</p>
                      <p className="text-on-surface-variant mt-xs">Estimated effort: <span className="text-on-surface font-medium">{formatHours(g.action.estimatedHours)}</span></p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-sm">
                    <button type="button" onClick={() => addGapToRoadmap(g.skill)} disabled={added} className={btnPrimary}>
                      {added ? 'Added to roadmap ✓' : 'Add to Roadmap'}
                    </button>
                    <button type="button" onClick={() => openAssessment({ skill: g.skill })} className={btnGhost}>Log a skill check</button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* Explainability */}
        <details className={`${cardCls} p-md`}>
          <summary className="cursor-pointer text-sm font-semibold text-on-surface">How your skill levels are calculated</summary>
          <p className="text-xs text-on-surface-variant mt-sm mb-md leading-relaxed">
            Level = your self-rating (or 40 if you only listed the skill) + 5 per project that uses it + 10 per certification + points from finished roadmap tasks. A logged skill check counts for 80% once it exists.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {snapshot.skills.slice(0, 12).map(s => (
              <li key={s.name} className="text-sm">
                <p className="flex items-center justify-between"><span className="text-on-surface font-medium">{s.name}{s.verified && <span className="ml-xs text-emerald-300 text-xs"> ✓ verified</span>}</span><span className="tabular-nums text-on-surface-variant">{s.level}</span></p>
                <ul className="text-xs text-on-surface-variant list-disc pl-4 mt-1">{s.evidence.map(e => <li key={e}>{e}</li>)}</ul>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </PageShell>
  );
}
