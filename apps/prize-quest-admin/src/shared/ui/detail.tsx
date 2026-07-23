import { type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * Detail-screen hero (plan §8 `DetailHero`, prototype `.detail-hero`): status
 * pills, title, sub, a meta grid, and a right-aligned action slot.
 */
export function DetailHero({
  pills,
  title,
  subtitle,
  meta,
  actions,
}: {
  pills?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: Array<{ label: string; value: ReactNode }>;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-1 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          {pills ? <div className="flex flex-wrap items-center gap-2">{pills}</div> : null}
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
          {subtitle ? <p className="max-w-2xl text-sm text-text-secondary">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>

      {meta && meta.length > 0 ? (
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-hairline pt-5 sm:grid-cols-4">
          {meta.map((m, i) => (
            <div key={i} className="space-y-1">
              <dt className="text-2xs uppercase tracking-wide text-text-tertiary">{m.label}</dt>
              <dd className="font-display text-lg font-semibold tabular-nums text-text-primary">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

/** Titled card with an optional right-aligned action (e.g. an Edit deep-link). */
export function DetailCard({
  title,
  action,
  children,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-hairline bg-surface-1 p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-sm font-semibold text-text-primary">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Key/value rows (plan §8 `DescriptionList`, prototype `.detail-list`). */
export function DescriptionList({
  items,
}: {
  items: Array<{ label: ReactNode; value: ReactNode }>;
}) {
  return (
    <dl className="divide-y divide-hairline">
      {items.map((item, i) => (
        <div key={i} className="flex items-start justify-between gap-6 py-2.5 first:pt-0 last:pb-0">
          <dt className="shrink-0 text-xs text-text-tertiary">{item.label}</dt>
          <dd className="text-right text-sm text-text-secondary">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
