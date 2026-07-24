import { cn } from "@/shared/lib/cn";

export interface PresetChip {
  value: string;
  label: string;
}

/** Quick-select chips (prototype `.preset-chips`), e.g. schedule presets. */
export function PresetChips({
  chips,
  value,
  onSelect,
  className,
  ariaLabel = "Presets",
}: {
  chips: PresetChip[];
  value?: string;
  onSelect: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className={cn("flex flex-wrap gap-1.5", className)}>
      {chips.map((chip) => {
        const active = chip.value === value;
        return (
          <button
            key={chip.value}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(chip.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              active
                ? "border-brand/40 bg-brand-subtle text-brand-bright"
                : "border-hairline bg-surface-1 text-text-tertiary hover:text-text-secondary",
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
