import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface QuickAction {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
}

/** A compact grid of primary next-actions. */
export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {actions.map((action) => (
        <button
          key={action.title}
          type="button"
          onClick={action.onClick}
          className={cn(
            "group flex items-center gap-3 rounded-lg border border-hairline bg-surface-1 p-3 text-left",
            "transition-colors duration-fast ease-out hover:border-brand/40 hover:bg-surface-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-2 text-brand transition-colors group-hover:bg-brand-subtle">
            <action.icon className="size-4" strokeWidth={1.9} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-text-primary">{action.title}</span>
            <span className="block truncate text-xs text-text-tertiary">{action.subtitle}</span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5" />
        </button>
      ))}
    </div>
  );
}
