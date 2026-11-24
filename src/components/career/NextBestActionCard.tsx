import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { NextBestAction } from '../../career/types';
import { formatHours } from '../../career/engine/util';
import { useCareer } from '../../context/CareerContext';
import { useCareerModals } from './CareerModals';
import { AIBadge, ImpactPill, btnPrimary, cardCls, labelCls } from './ui';

/** Performs the CTA of any next-best-action. Shared by Copilot, Home, Roadmap, Opportunities and Mentor views. */
export function useRunAction() {
  const navigate = useNavigate();
  const { openProfile, openAssessment } = useCareerModals();
  return useCallback(
    (a: NextBestAction) => {
      const t = a.target;
      switch (t.type) {
        case 'task':
          navigate(`/career/roadmap#task-${t.taskId}`);
          break;
        case 'route':
          navigate(t.to);
          break;
        case 'opportunity':
          navigate(`/career/opportunities?open=${encodeURIComponent(t.id)}`);
          break;
        case 'assess':
          openAssessment({ skill: t.skill });
          break;
        case 'profile':
          openProfile();
          break;
      }
    },
    [navigate, openProfile, openAssessment],
  );
}

const SOURCE_LABEL: Record<NextBestAction['source'], string> = {
  skill_gap: 'From your skill gaps',
  roadmap: 'From your roadmap',
  assessment: 'From your assessments',
  opportunity: 'From your opportunities',
  mentor: 'From your mentor',
  profile: 'From your profile',
  project: 'From your portfolio',
};

export function NextBestActionCard({
  action,
  variant = 'full',
}: {
  action?: NextBestAction;
  variant?: 'full' | 'compact';
}) {
  const { snapshot } = useCareer();
  const run = useRunAction();
  const a = action ?? snapshot.nextBestAction;

  if (variant === 'compact') {
    return (
      <section aria-label="Next best action" className={`${cardCls} p-md relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/15 to-transparent pointer-events-none" />
        <div className="relative flex flex-col gap-sm">
          <div className="flex items-center justify-between gap-sm">
            <p className="text-xs font-semibold tracking-widest text-primary flex items-center gap-1"><span aria-hidden="true">✦</span> NEXT BEST ACTION</p>
            <Link to="/career" className="text-xs text-on-surface-variant hover:text-primary">Career Copilot →</Link>
          </div>
          <h2 className="text-base font-bold text-on-surface leading-snug">{a.title}</h2>
          <p className="text-sm text-on-surface-variant line-clamp-2">{a.reason}</p>
          <div className="flex items-center justify-between gap-sm">
            <span className="text-xs text-on-surface-variant">{SOURCE_LABEL[a.source]} · {formatHours(a.estimatedHours)}</span>
            <button type="button" onClick={() => run(a)} className={btnPrimary}>{a.ctaLabel}</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="nba-title" className={`${cardCls} p-lg relative overflow-hidden`}>
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col gap-md">
        <div className="flex flex-wrap items-center gap-sm">
          <p className="text-xs font-semibold tracking-widest text-primary flex items-center gap-1"><span aria-hidden="true">✦</span> NEXT BEST ACTION</p>
          <ImpactPill impact={a.impact} />
          <span className="text-xs text-on-surface-variant">{SOURCE_LABEL[a.source]}</span>
        </div>
        <h2 id="nba-title" className="text-xl md:text-2xl font-bold text-on-surface leading-snug">{a.title}</h2>
        <dl className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-md text-sm">
          <div>
            <dt className={labelCls}>Why this action?</dt>
            <dd className="mt-xs text-on-surface leading-relaxed">{a.reason}</dd>
          </div>
          <div>
            <dt className={labelCls}>How</dt>
            <dd className="mt-xs text-on-surface leading-relaxed">{a.how}</dd>
          </div>
          <div>
            <dt className={labelCls}>Estimated effort</dt>
            <dd className="mt-xs text-on-surface font-semibold whitespace-nowrap">{formatHours(a.estimatedHours)}</dd>
          </div>
        </dl>
        <div>
          <button type="button" onClick={() => run(a)} className={btnPrimary}>{a.ctaLabel}</button>
        </div>
      </div>
    </section>
  );
}

export { AIBadge };
