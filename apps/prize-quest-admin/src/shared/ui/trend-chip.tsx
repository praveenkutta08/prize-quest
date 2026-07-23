import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export type Trend = "up" | "down" | "neutral";

const TONE: Record<Trend, string> = {
  up: "text-success",
  down: "text-danger",
  neutral: "text-text-tertiary",
};

const ICON = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
};

/** Compact signed-trend indicator for KPI deltas. */
export function TrendChip({
  trend,
  label,
  className,
}: {
  trend: Trend;
  label: string;
  className?: string;
}) {
  const Icon = ICON[trend];
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-xs font-medium", TONE[trend], className)}
    >
      <Icon className="size-3.5" strokeWidth={2.4} />
      <span>{label}</span>
    </span>
  );
}
