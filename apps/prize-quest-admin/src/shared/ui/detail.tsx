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
          {/* h2, not h1: every DetailHero page also renders a PageHeader that owns
              the page's single h1, so the hero is the first section under it. */}
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
            {title}
          </h2>
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
  headingLevel: Heading = "h2",
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /**
   * Heading element for the card title. Defaults to `h2` — a card is normally a
   * top-level section directly under the page `h1`. Pass `h3` when the card is
   * nested inside a section that already owns an `h2`, so the document heading
   * order never skips a level (WCAG 1.3.1 / heading-order).
   */
  headingLevel?: "h2" | "h3";
}) {
  return (
    <section className={cn("rounded-xl border border-hairline bg-surface-1 p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Heading className="font-display text-sm font-semibold text-text-primary">{title}</Heading>
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
