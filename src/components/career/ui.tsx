import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import type { SkillStatus } from '../../career/types';

// ─────────────────────────────────────────
// Small presentational primitives shared by the Career pages.
// They only use TRYBE's existing tokens (surface / outline / primary …).
// ─────────────────────────────────────────

export const cardCls = 'bg-surface border border-outline-variant rounded-xl';
export const labelCls = 'text-xs font-semibold uppercase tracking-wider text-on-surface-variant';
export const btnPrimary =
  'inline-flex items-center justify-center gap-xs px-md py-sm rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed';
export const btnGhost =
  'inline-flex items-center justify-center gap-xs px-md py-sm rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed';
export const inputCls =
  'w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-3 text-sm text-on-background placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary transition-colors';

export function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}

export function AIBadge({ children = 'AI' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full bg-primary-container/25 text-primary border border-primary-container/40 text-[11px] font-semibold tracking-wide">
      <span aria-hidden="true">✦</span>
      {children}
    </span>
  );
}

/** Honest provenance label: AI-written vs rules-based. */
export function SourceChip({ source }: { source: 'ai' | 'rules' }) {
  return source === 'ai' ? (
    <AIBadge>AI Insight</AIBadge>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant text-[11px] font-medium">
      TRYBE Insight
    </span>
  );
}

export function ProgressBar({
  value,
  label,
  tone = 'primary',
  size = 'md',
}: {
  value: number;
  label: string;
  tone?: 'primary' | 'good' | 'warn' | 'bad';
  size?: 'sm' | 'md' | 'lg';
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const color = { primary: 'bg-primary', good: 'bg-emerald-400', warn: 'bg-amber-400', bad: 'bg-error' }[tone];
  const h = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }[size];
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      className={`w-full ${h} rounded-full bg-surface-container-high overflow-hidden`}
    >
      <div className={`${h} ${color} rounded-full transition-all duration-500`} style={{ width: `${v}%` }} />
    </div>
  );
}

export function toneFor(pct: number): 'good' | 'warn' | 'bad' {
  return pct >= 75 ? 'good' : pct >= 45 ? 'warn' : 'bad';
}

export function AIThinking({ text = 'TRYBE AI is analyzing your profile...' }: { text?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-sm">
      <p className="text-sm text-primary flex items-center gap-xs">
        <span aria-hidden="true" className="animate-pulse">✦</span> {text}
      </p>
      <div className="flex flex-col gap-xs" aria-hidden="true">
        <div className="h-3 rounded bg-surface-container-high animate-pulse w-11/12" />
        <div className="h-3 rounded bg-surface-container-high animate-pulse w-9/12" />
        <div className="h-3 rounded bg-surface-container-high animate-pulse w-10/12" />
      </div>
    </div>
  );
}

export function AIFailedNotice({ onRetry, what = 'AI recommendation' }: { onRetry?: () => void; what?: string }) {
  return (
    <div role="alert" className="flex flex-col sm:flex-row sm:items-center gap-sm justify-between rounded-lg border border-amber-400/30 bg-amber-400/5 px-md py-sm">
      <p className="text-sm text-on-surface-variant">
        We couldn’t generate your {what} right now. Your existing career data is safe — showing TRYBE’s built-in analysis instead.
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={btnGhost}>
          <Icon name="refresh" className="text-[18px]" /> Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon = 'auto_awesome',
  title,
  body,
  action,
}: {
  icon?: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className={`${cardCls} p-xl flex flex-col items-center text-center gap-md`}>
      <div className="w-14 h-14 rounded-full bg-primary-container/20 text-primary flex items-center justify-center">
        <Icon name={icon} className="text-[28px]" />
      </div>
      <h2 className="text-lg font-bold text-on-surface">{title}</h2>
      <p className="text-sm text-on-surface-variant max-w-md">{body}</p>
      {action}
    </div>
  );
}

const STATUS: Record<SkillStatus, { label: string; cls: string; icon: string }> = {
  strong: { label: 'Strong', cls: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10', icon: 'check_circle' },
  needs_improvement: { label: 'Needs improvement', cls: 'text-amber-300 border-amber-400/30 bg-amber-400/10', icon: 'warning' },
  critical: { label: 'Critical gap', cls: 'text-error border-error/30 bg-error-container/20', icon: 'error' },
};

export function StatusPill({ status }: { status: SkillStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-[2px] rounded-full border text-[11px] font-semibold ${s.cls}`}>
      <Icon name={s.icon} className="text-[14px]" />
      {s.label}
    </span>
  );
}

export function ImpactPill({ impact }: { impact: 'high' | 'medium' | 'low' }) {
  const cls = {
    high: 'text-primary border-primary/40 bg-primary-container/20',
    medium: 'text-on-surface border-outline-variant bg-surface-container-high',
    low: 'text-on-surface-variant border-outline-variant bg-surface-container-low',
  }[impact];
  return <span className={`px-2 py-[2px] rounded-full border text-[11px] font-semibold capitalize ${cls}`}>{impact} impact</span>;
}

// ─────────────────────────────────────────
// Career navigation (also gives mobile users access to every Career page)
// ─────────────────────────────────────────

const TABS = [
  { to: '/career', label: 'Copilot', icon: 'auto_awesome', end: true },
  { to: '/career/readiness', label: 'Readiness', icon: 'query_stats', end: false },
  { to: '/career/roadmap', label: 'Roadmap', icon: 'route', end: false },
  { to: '/career/opportunities', label: 'Opportunities', icon: 'bolt', end: false },
  { to: '/career/mentor', label: 'Mentor Desk', icon: 'supervisor_account', end: false },
];

export function CareerTabs() {
  return (
    <nav aria-label="Career sections" className="flex gap-lg border-b border-outline-variant mb-xl overflow-x-auto scrollbar-hide whitespace-nowrap">
      {TABS.map(t => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            `pb-2 px-1 flex items-center gap-xs text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-primary ${
              isActive ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          <Icon name={t.icon} className="text-[18px]" />
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function PageShell({
  title,
  subtitle,
  actions,
  children,
  tabs = true,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
  tabs?: boolean;
}) {
  return (
    <div className="flex-1 overflow-y-auto relative">
      <div className="max-w-[1100px] mx-auto p-margin-mobile md:p-margin-desktop pb-28 md:pb-margin-desktop relative z-10">
        <header className="mb-lg flex flex-col sm:flex-row sm:items-start sm:justify-between gap-md">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-widest text-primary mb-xs flex items-center gap-1">
              <span aria-hidden="true">✦</span> CAREER
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">{title}</h1>
            <p className="text-sm md:text-base text-on-surface-variant mt-xs max-w-2xl">{subtitle}</p>
          </div>
          {actions && <div className="flex gap-sm shrink-0 flex-wrap">{actions}</div>}
        </header>
        {tabs && <CareerTabs />}
        {children}
      </div>
    </div>
  );
}

export function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'primary' }) {
  const cls = {
    neutral: 'bg-surface-container-high text-on-surface border-outline-variant',
    good: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
    warn: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
    bad: 'bg-error-container/20 text-error border-error/30',
    primary: 'bg-primary-container/20 text-primary border-primary-container/40',
  }[tone];
  return <span className={`inline-flex items-center gap-1 px-2 py-[2px] rounded border text-[11px] font-medium ${cls}`}>{children}</span>;
}
