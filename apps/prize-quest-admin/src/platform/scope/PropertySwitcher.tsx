import type { ReactNode } from "react";
import { Building2, Check, ChevronsUpDown, Layers } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { ALL_PROPERTIES, setActiveProperty } from "./scopeSlice";

/**
 * Global scope control. Switching updates the scope slice; because the active
 * property is both the RTK Query cache key and the X-Property-Id header, every
 * scoped view re-fetches and re-scopes. Used constantly, so it's designed to read
 * clearly at a glance.
 */
export function PropertySwitcher() {
  const dispatch = useAppDispatch();
  const properties = useAppSelector((s) => s.tenant.context?.properties ?? []);
  const activeId = useAppSelector((s) => s.scope.activePropertyId) ?? ALL_PROPERTIES;

  const isAll = activeId === ALL_PROPERTIES;
  const active = properties.find((p) => p.id === activeId);
  const currentLabel = isAll ? "All properties" : (active?.name ?? "Select property");
  const currentCode = isAll ? "ALL" : (active?.code ?? "—");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="h-9 gap-2 pl-2.5 pr-2 text-left font-normal"
          // No aria-label: the visible "Property / <name> / <code>" content is the
          // accessible name, so it can't violate WCAG 2.5.3 (label-in-name).
        >
          <span className="flex size-6 items-center justify-center rounded-md bg-brand-subtle text-brand-bright">
            {isAll ? <Layers className="size-3.5" /> : <Building2 className="size-3.5" />}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-2xs uppercase tracking-wide text-text-tertiary">Property</span>
            <span className="max-w-[9rem] truncate text-xs font-medium text-text-primary">
              {currentLabel}
            </span>
          </span>
          <span className="ml-1 font-mono text-2xs text-text-tertiary">{currentCode}</span>
          <ChevronsUpDown className="size-3.5 text-text-tertiary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Scope data by property</DropdownMenuLabel>
        <PropertyRow
          label="All properties"
          hint="Cross-property roll-up"
          code="ALL"
          selected={isAll}
          onSelect={() => dispatch(setActiveProperty(ALL_PROPERTIES))}
          icon={<Layers className="size-4" />}
        />
        <DropdownMenuSeparator />
        {properties.map((p) => (
          <PropertyRow
            key={p.id}
            label={p.name}
            hint={p.jurisdiction}
            code={p.code}
            selected={p.id === activeId}
            onSelect={() => dispatch(setActiveProperty(p.id))}
            icon={<Building2 className="size-4" />}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PropertyRow({
  label,
  hint,
  code,
  selected,
  onSelect,
  icon,
}: {
  label: string;
  hint: string;
  code: string;
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
}) {
  return (
    <DropdownMenuItem onSelect={onSelect} className="gap-2.5 py-2">
      <span className="text-text-tertiary">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-text-primary">{label}</span>
        <span className="block text-2xs text-text-tertiary">{hint}</span>
      </span>
      <span className="font-mono text-2xs text-text-tertiary">{code}</span>
      <Check className={cn("size-4 text-brand", selected ? "opacity-100" : "opacity-0")} />
    </DropdownMenuItem>
  );
}
