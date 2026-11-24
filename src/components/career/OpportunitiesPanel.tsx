import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Modal } from '../Modal';
import { useCareer } from '../../context/CareerContext';
import { getPlaybook } from '../../career/data/skills';
import { MATCH_WEIGHTS } from '../../career/engine/opportunities';
import { formatHours } from '../../career/engine/util';
import type { OpportunityStatus, OpportunityType, ScoredOpportunity } from '../../career/types';
import { explainOpportunityLocally, explainOpportunityMatch } from '../../ai/opportunityMatcher';
import { signatureOf } from '../../ai/aiService';
import { useAiOutcome } from '../../ai/useAiOutcome';
import { useCareerModals } from './CareerModals';
import { AIFailedNotice, AIThinking, Chip, Icon, ProgressBar, SourceChip, btnGhost, btnPrimary, cardCls, labelCls, toneFor } from './ui';

const TYPE_LABEL: Record<OpportunityType, string> = {
  internship: 'Internship', job: 'Job', hackathon: 'Hackathon', certification: 'Certification',
  competition: 'Competition', project: 'Project', research: 'Research',
};
const FILTERS: { id: 'all' | OpportunityType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'internship', label: 'Internships' },
  { id: 'job', label: 'Jobs' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'certification', label: 'Certifications' },
  { id: 'project', label: 'Projects' },
  { id: 'competition', label: 'Competitions' },
  { id: 'research', label: 'Research' },
];
type Sort = 'match' | 'deadline' | 'newest';

function deadlineText(o: ScoredOpportunity): string {
  if (o.expired) return 'Closed';
  if (o.daysLeft === undefined) return 'Rolling — no deadline';
  if (o.daysLeft === 0) return 'Closes today';
  return `Closes in ${o.daysLeft} day${o.daysLeft === 1 ? '' : 's'}`;
}

const STATE_ICON = { have: '✓', partial: '⚠', missing: '✕' } as const;
const STATE_TONE = { have: 'good', partial: 'warn', missing: 'bad' } as const;

function SkillChips({ item, limit = 6 }: { item: ScoredOpportunity; limit?: number }) {
  if (item.skillDetails.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-xs" aria-label="Skill match">
      {item.skillDetails.slice(0, limit).map(d => (
        <li key={d.skill}>
          <Chip tone={STATE_TONE[d.state]}>
            <span aria-hidden="true">{STATE_ICON[d.state]}</span>
            <span className="sr-only">{d.state === 'have' ? 'You have' : d.state === 'partial' ? 'Partly have' : 'Missing'}</span>
            {d.skill}{!d.required && <span className="opacity-70"> (bonus)</span>}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

function Detail({ item, onClose }: { item: ScoredOpportunity; onClose: () => void }) {
  const { snapshot, student, setOpportunityStatus, addGapToRoadmap } = useCareer();
  const navigate = useNavigate();
  const { openProfile } = useCareerModals();
  const o = item.opportunity;
  const status = student.opportunityStatus[o.id];

  const { outcome, loading, retry } = useAiOutcome({
    enabled: true,
    signature: signatureOf('opp', o.id, item.score, snapshot.role?.id),
    fallback: explainOpportunityLocally(item),
    fetcher: fresh => explainOpportunityMatch(snapshot, item, { fresh }),
  });

  const toggle = (s: OpportunityStatus) => setOpportunityStatus(o.id, status === s ? null : s);
  const comp: [string, number, number][] = [
    ['Skill match', item.components.skill, MATCH_WEIGHTS.skill],
    ['Career alignment', item.components.career, MATCH_WEIGHTS.career],
    ['Experience level', item.components.experience, MATCH_WEIGHTS.experience],
    ['Interest match', item.components.interest, MATCH_WEIGHTS.interest],
    ['Location / remote', item.components.location, MATCH_WEIGHTS.location],
    ['Deadline fit', item.components.deadline, MATCH_WEIGHTS.deadline],
  ];
  const fixable = item.missing.filter(s => getPlaybook(s) && snapshot.student.roadmap);

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      icon="bolt"
      title={o.title}
      subtitle={`${o.organization} · ${TYPE_LABEL[o.type]}`}
      footer={
        <>
          <button type="button" onClick={() => toggle('saved')} className={btnGhost} aria-pressed={status === 'saved'}>{status === 'saved' ? 'Saved ✓' : 'Save'}</button>
          {o.internalPath && <button type="button" onClick={() => { onClose(); navigate(o.internalPath!); }} className={btnGhost}>Open in Work</button>}
          {o.url && <a href={o.url} target="_blank" rel="noopener noreferrer" className={btnGhost}>Official page</a>}
          <button type="button" onClick={() => toggle('applied')} className={btnPrimary} aria-pressed={status === 'applied'}>{status === 'applied' ? 'Marked as applied ✓' : 'Mark as applied'}</button>
        </>
      }
    >
      <div className="flex flex-col gap-lg">
        <div className="flex items-center gap-lg">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary tabular-nums">{item.score}%</p>
            <p className={labelCls}>Match</p>
          </div>
          <div className="flex-1 min-w-0 text-sm text-on-surface-variant flex flex-col gap-1">
            <p><Icon name="schedule" className="text-[16px] align-middle mr-1" />{deadlineText(item)}</p>
            <p><Icon name="place" className="text-[16px] align-middle mr-1" />{o.location}{o.remote ? ' · Remote-friendly' : ''}</p>
            <p><Icon name="school" className="text-[16px] align-middle mr-1" />{o.experienceLevel === 'Any' ? 'Open to all levels' : `${o.experienceLevel} level`}</p>
          </div>
        </div>

        <p className="text-sm text-on-surface leading-relaxed">{o.description}</p>

        <section aria-labelledby="why-h" className="rounded-lg border border-outline-variant bg-surface-container-low p-md flex flex-col gap-sm">
          <div className="flex items-center justify-between gap-sm">
            <h3 id="why-h" className="text-xs font-bold tracking-widest text-primary flex items-center gap-1"><span aria-hidden="true">✦</span> WHY THIS MATCHES YOU</h3>
            {!loading && <SourceChip source={outcome.source} />}
          </div>
          {loading ? <AIThinking /> : (
            <>
              {outcome.status === 'failed' && <AIFailedNotice onRetry={retry} what="AI explanation" />}
              <p className="text-sm text-on-surface leading-relaxed">{outcome.data}</p>
            </>
          )}
        </section>

        <section aria-labelledby="skills-h">
          <h3 id="skills-h" className={`${labelCls} mb-sm`}>Skills</h3>
          {item.skillDetails.length === 0 ? <p className="text-sm text-on-surface-variant">No specific skills required.</p> : <SkillChips item={item} limit={12} />}
          {o.teaches && o.teaches.length > 0 && <p className="text-sm text-on-surface-variant mt-sm">You’ll build: <span className="text-on-surface">{o.teaches.join(', ')}</span></p>}
        </section>

        {fixable.length > 0 && (
          <section aria-labelledby="fix-h">
            <h3 id="fix-h" className={`${labelCls} mb-sm`}>Close the gap before you apply</h3>
            <ul className="flex flex-col gap-xs">
              {fixable.map(s => {
                const pb = getPlaybook(s)!;
                return (
                  <li key={s} className="flex flex-wrap items-center justify-between gap-sm rounded-lg bg-surface-container-low px-sm py-2">
                    <span className="text-sm text-on-surface">{s} — {pb.project.title.replace(/\{project\}/g, 'a project')} <span className="text-on-surface-variant">({formatHours(pb.project.hours)})</span></span>
                    <button type="button" onClick={() => addGapToRoadmap(s)} className={btnGhost}>Add to Roadmap</button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section aria-labelledby="break-h">
          <h3 id="break-h" className={`${labelCls} mb-sm`}>How the score is calculated</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {comp.map(([label, v, w]) => (
              <li key={label}>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1"><span>{label} · {Math.round(w * 100)}%</span><span className="tabular-nums">{Math.round(v * 100)}%</span></div>
                <ProgressBar value={v * 100} label={label} tone={toneFor(v * 100)} size="sm" />
              </li>
            ))}
          </ul>
          {!snapshot.role && (
            <p className="text-xs text-on-surface-variant mt-sm">No target role chosen, so career alignment is neutral. <button type="button" onClick={openProfile} className="text-primary underline cursor-pointer">Choose a role</button> for sharper matches.</p>
          )}
        </section>
      </div>
    </Modal>
  );
}

export function OpportunitiesPanel({ embedded = false }: { embedded?: boolean }) {
  const { snapshot, student, setOpportunityStatus } = useCareer();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<'all' | OpportunityType>('all');
  const [sort, setSort] = useState<Sort>('match');
  const [showDismissed, setShowDismissed] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const paramId = embedded ? null : params.get('open');
  useEffect(() => {
    if (paramId) setOpenId(paramId);
  }, [paramId]);

  const close = () => {
    setOpenId(null);
    if (paramId) {
      const next = new URLSearchParams(params);
      next.delete('open');
      setParams(next, { replace: true });
    }
  };

  const all = useMemo(() => snapshot.opportunities.filter(o => !o.expired), [snapshot.opportunities]);
  const dismissed = all.filter(o => student.opportunityStatus[o.opportunity.id] === 'dismissed');
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    for (const o of all) c[o.opportunity.type] = (c[o.opportunity.type] ?? 0) + 1;
    return c;
  }, [all]);

  const list = useMemo(() => {
    const filtered = all.filter(o => (filter === 'all' || o.opportunity.type === filter) && (showDismissed || student.opportunityStatus[o.opportunity.id] !== 'dismissed'));
    const sorted = [...filtered];
    if (sort === 'match') sorted.sort((a, b) => b.score - a.score);
    else if (sort === 'deadline') sorted.sort((a, b) => (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999) || b.score - a.score);
    else sorted.sort((a, b) => b.opportunity.postedAt.localeCompare(a.opportunity.postedAt));
    return sorted;
  }, [all, filter, sort, showDismissed, student.opportunityStatus]);

  const current = openId ? snapshot.opportunities.find(o => o.opportunity.id === openId) : undefined;

  return (
    <div className="flex flex-col gap-lg">
      <section aria-label="Filters" className="flex flex-col md:flex-row md:items-center gap-sm justify-between">
        <div role="group" aria-label="Filter by type" className="flex gap-xs overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.filter(f => f.id === 'all' || counts[f.id]).map(f => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`px-md py-1.5 rounded-full border text-sm whitespace-nowrap transition-colors cursor-pointer ${filter === f.id ? 'border-primary bg-primary-container/25 text-primary font-semibold' : 'border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}
            >
              {f.label} <span className="opacity-70">{counts[f.id] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-xs shrink-0">
          <label htmlFor="opp-sort" className="text-xs text-on-surface-variant">Sort by</label>
          <select id="opp-sort" value={sort} onChange={e => setSort(e.target.value as Sort)} className="bg-surface-container-low border border-outline-variant rounded-lg py-1.5 px-2 text-sm text-on-background focus:outline-none focus:border-primary">
            <option value="match">Best match</option>
            <option value="deadline">Deadline</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </section>

      <p className="text-sm text-on-surface-variant -mt-2">
        <span className="text-primary" aria-hidden="true">✦ </span>
        {snapshot.role ? `Ranked for your ${snapshot.role.title} goal and current skills.` : 'Choose a target role for sharper, personalised matches.'}
        {' '}Sample listings are demo data; project listings come from TRYBE Work.
      </p>

      {list.length === 0 ? (
        <div className={`${cardCls} p-xl text-center text-sm text-on-surface-variant`}>No opportunities in this category right now.</div>
      ) : (
        <ul className="flex flex-col gap-md">
          {list.map(m => {
            const o = m.opportunity;
            const st = student.opportunityStatus[o.id];
            return (
              <li key={o.id} className={`${cardCls} p-md md:p-lg flex flex-col gap-sm ${st === 'dismissed' ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-md">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-xs mb-xs">
                      <Chip>{TYPE_LABEL[o.type]}</Chip>
                      {st === 'applied' && <Chip tone="good">Applied</Chip>}
                      {st === 'saved' && <Chip tone="primary">Saved</Chip>}
                      <span className="text-xs text-on-surface-variant">{deadlineText(m)}</span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-on-surface">{o.title}</h3>
                    <p className="text-sm text-on-surface-variant">{o.organization} · {o.location}</p>
                  </div>
                  <div className="text-right shrink-0" data-match={m.score}>
                    <p className={`text-2xl md:text-3xl font-bold tabular-nums ${m.score >= 75 ? 'text-emerald-300' : m.score >= 50 ? 'text-primary' : 'text-on-surface-variant'}`}>{m.score}%</p>
                    <p className="text-[11px] font-semibold tracking-widest text-on-surface-variant">MATCH</p>
                  </div>
                </div>
                <SkillChips item={m} />
                <div className="text-sm text-on-surface-variant leading-relaxed">
                  <span className="text-on-surface font-medium">Why this matches you: </span>{m.reasons.join(' ') || 'Broadly fits your profile.'}
                  {m.missing.length > 0 && <span className="block mt-1"><span className="text-on-surface font-medium">Missing: </span>{m.missing.join(', ')}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-sm pt-1">
                  <button type="button" onClick={() => setOpenId(o.id)} className={btnPrimary}>View Opportunity</button>
                  <button type="button" onClick={() => setOpportunityStatus(o.id, st === 'saved' ? null : 'saved')} aria-pressed={st === 'saved'} className={btnGhost}>{st === 'saved' ? 'Saved ✓' : 'Save'}</button>
                  {st !== 'dismissed' ? (
                    <button type="button" onClick={() => setOpportunityStatus(o.id, 'dismissed')} className="text-sm text-on-surface-variant hover:text-on-surface underline underline-offset-2 cursor-pointer">Not interested</button>
                  ) : (
                    <button type="button" onClick={() => setOpportunityStatus(o.id, null)} className="text-sm text-primary underline underline-offset-2 cursor-pointer">Undo</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {dismissed.length > 0 && (
        <button type="button" onClick={() => setShowDismissed(v => !v)} className="self-start text-sm text-on-surface-variant hover:text-on-surface underline underline-offset-2 cursor-pointer">
          {showDismissed ? 'Hide' : 'Show'} {dismissed.length} dismissed
        </button>
      )}

      {current && <Detail key={current.opportunity.id} item={current} onClose={close} />}
    </div>
  );
}
