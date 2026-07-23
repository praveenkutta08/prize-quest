import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

/**
 * Status semantics for the whole console. Discipline (per the token system):
 *   active/live → success (jade) · scheduled/forthcoming → info (steel-blue)
 *   draft → neutral · paused → warning (amber) · ended → muted · event → brand
 *   danger → destructive/error only.
 * Encodes state in FORM (a dot + colour), not just text, so it reads at a glance.
 */
const pillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-2xs font-semibold capitalize",
  {
    variants: {
      tone: {
        active: "border-success/30 bg-success-soft text-success",
        scheduled: "border-info/30 bg-info-soft text-info",
        draft: "border-hairline bg-draft-soft text-draft",
        paused: "border-warning/30 bg-warning-soft text-warning",
        ended: "border-hairline bg-surface-2 text-text-tertiary",
        event: "border-brand/35 bg-brand-subtle text-brand-bright",
        danger: "border-danger/30 bg-danger-soft text-danger",
      },
    },
    defaultVariants: { tone: "draft" },
  },
);

const DOT: Record<string, string> = {
  active: "bg-success",
  scheduled: "bg-info",
  draft: "bg-draft",
  paused: "bg-warning",
  ended: "bg-text-tertiary",
  event: "bg-brand-bright",
  danger: "bg-danger",
};

export type StatusTone = NonNullable<VariantProps<typeof pillVariants>["tone"]>;

export interface StatusPillProps extends VariantProps<typeof pillVariants> {
  children: ReactNode;
  className?: string;
  /** Pulse the dot (e.g. a live/active state). */
  pulse?: boolean;
}

export function StatusPill({ tone = "draft", children, className, pulse }: StatusPillProps) {
  const key = tone ?? "draft";
  return (
    <span className={cn(pillVariants({ tone }), className)}>
      <span className="relative flex size-1.5">
        {pulse ? (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-60",
              DOT[key],
            )}
          />
        ) : null}
        <span className={cn("relative inline-flex size-1.5 rounded-full", DOT[key])} />
      </span>
      {children}
    </span>
  );
}
