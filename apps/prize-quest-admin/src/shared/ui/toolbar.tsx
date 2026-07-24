import { type ComponentType, type ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { count } from "@/shared/lib/format";

/** Toolbar shell: tabs on the left, actions pushed to the right. */
export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-hairline pb-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ToolbarSpacer() {
  return <div className="flex-1" />;
}

export interface StatusTab {
  key: string;
  label: string;
  count?: number;
}

/** Segmented status tabs with counts (All / Active / …). Fully keyboard-navigable. */
export function StatusTabs({
  tabs,
  value,
  onChange,
  ariaLabel = "Filter by status",
}: {
  tabs: StatusTab[];
  value: string;
  onChange: (key: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex flex-wrap items-center gap-1">
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              active
                ? "bg-surface-2 text-text-primary"
                : "text-text-tertiary hover:bg-surface-1 hover:text-text-secondary",
            )}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-2xs tabular-nums",
                  active ? "bg-brand-subtle text-brand-bright" : "bg-surface-2 text-text-tertiary",
                )}
              >
                {count(tab.count)}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Small search input with a leading icon (controlled; caller debounces). */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={cn(
          "h-9 w-full rounded-md border border-input bg-surface-sunken pl-9 pr-3 text-sm text-text-primary",
          "placeholder:text-text-tertiary transition-[border-color,box-shadow] duration-fast ease-out",
          "focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        )}
      />
    </div>
  );
}

export interface SegmentedOption {
  value: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
}

/** Two-or-more-way segmented control (e.g. List / Calendar view toggle). */
export function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel = "View",
}: {
  options: SegmentedOption[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-0.5 rounded-md border border-hairline bg-surface-1 p-0.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              active
                ? "bg-surface-3 text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {Icon ? <Icon className="size-3.5" /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
