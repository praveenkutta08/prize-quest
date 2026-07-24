import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

/** On-brand empty state — an invitation to act, not a dead end. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  compact,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-hairline-strong bg-surface-1/40 text-center",
        compact ? "gap-2 p-8" : "gap-3 p-14",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full border border-hairline bg-surface-2 text-text-tertiary">
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <div className="space-y-1">
        <p className="font-display text-md font-semibold text-text-primary">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-text-tertiary">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
