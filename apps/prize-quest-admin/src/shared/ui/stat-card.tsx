import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Skeleton } from "./skeleton";
import { TrendChip, type Trend } from "./trend-chip";

interface StatCardProps {
  label: string;
  /** Preformatted display value (money/count formatting happens upstream). */
  value: ReactNode;
  delta?: { trend: Trend; label: string };
  /** Progress against a cap (e.g. liability % of budget) — rendered as an amber meter. */
  progress?: { pct: number; label: string };
  icon?: ReactNode;
  className?: string;
}

/** KPI tile. Tabular figures, a clear value hierarchy, and an optional cap meter. */
export function StatCard({ label, value, delta, progress, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-hairline bg-card p-5",
        "transition-colors duration-base ease-out hover:border-hairline-strong",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
          {label}
        </span>
        {icon ? <span className="text-text-tertiary">{icon}</span> : null}
      </div>

      <div className="flex items-end justify-between gap-2">
        <span className="font-display text-4xl font-semibold tabular-nums tracking-tight text-text-primary">
          {value}
        </span>
        {delta ? <TrendChip trend={delta.trend} label={delta.label} className="mb-1.5" /> : null}
      </div>

      {progress ? (
        <div className="mt-0.5 space-y-1.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-warning transition-[width] duration-slow ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress.pct))}%` }}
            />
          </div>
          <p className="font-mono text-2xs text-text-tertiary">{progress.label}</p>
        </div>
      ) : null}
    </div>
  );
}

/** Loading placeholder matching the StatCard footprint. */
export function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-card p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-28" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
