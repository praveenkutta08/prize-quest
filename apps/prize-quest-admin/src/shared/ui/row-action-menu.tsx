import { type ComponentType } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export interface RowAction {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onSelect: () => void;
  /** Renders a top divider before this item. */
  separatorBefore?: boolean;
  /** Danger styling (e.g. Pause / End). */
  danger?: boolean;
  /** Hidden entirely when false (used for RBAC gating). */
  hidden?: boolean;
  disabled?: boolean;
}

/**
 * Kebab menu of per-row actions (plan §8 `ActionMenu`). Actions gated by
 * permission pass `hidden`. Stops row-click propagation so opening the menu
 * never navigates.
 */
export function RowActionMenu({
  actions,
  label = "Row actions",
}: {
  actions: RowAction[];
  label?: string;
}) {
  const visible = actions.filter((a) => !a.hidden);
  if (visible.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-md text-text-tertiary transition-colors",
          "hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          "data-[state=open]:bg-surface-2 data-[state=open]:text-text-primary",
        )}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {visible.map((action, i) => (
          <div key={i}>
            {action.separatorBefore ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              disabled={action.disabled}
              onSelect={action.onSelect}
              className={cn(action.danger && "text-danger focus:text-danger")}
            >
              {action.icon ? <action.icon className="size-4" /> : null}
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
