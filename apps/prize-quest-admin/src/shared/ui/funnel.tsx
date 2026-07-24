import { cn } from "@/shared/lib/cn";
import { count, percent } from "@/shared/lib/format";

export interface FunnelData {
  eligible: number;
  started: number;
  completed: number;
  claimed: number;
}

const STAGES: Array<{ key: keyof FunnelData; label: string }> = [
  { key: "eligible", label: "Eligible" },
  { key: "started", label: "Started" },
  { key: "completed", label: "Completed" },
  { key: "claimed", label: "Claimed" },
];

/**
 * Conversion funnel (plan §8 `Funnel`): eligible → started → completed → claimed,
 * each bar scaled to the eligible pool, with the derived claimed/eligible rate.
 */
export function Funnel({ data, className }: { data: FunnelData; className?: string }) {
  const max = Math.max(data.eligible, 1);
  // Conversion of qualified players: claimed / completed (falls back to eligible).
  const denom = data.completed || data.eligible;
  const rate = denom === 0 ? 0 : data.claimed / denom;
  return (
    <div className={cn("space-y-3", className)}>
      {STAGES.map((stage, i) => {
        const value = data[stage.key];
        const pct = Math.max(2, (value / max) * 100);
        const emphasized = stage.key === "completed" || stage.key === "claimed";
        return (
          <div key={stage.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-tertiary">{stage.label}</span>
              <span
                className={cn("tabular-nums", emphasized ? "text-success" : "text-text-secondary")}
              >
                {count(value)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-slow ease-out",
                  emphasized ? "bg-success/70" : "bg-brand/60",
                )}
                style={{ width: `${pct}%`, opacity: 1 - i * 0.08 }}
              />
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between border-t border-hairline pt-3">
        <span className="text-xs text-text-tertiary">Claim rate</span>
        <span className="font-display text-lg font-semibold tabular-nums text-success">
          {percent(rate)}
        </span>
      </div>
    </div>
  );
}
