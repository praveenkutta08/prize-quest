import { useAppSelector } from "@/app/hooks";
import { ALL_PROPERTIES } from "./scopeSlice";

/** Resolve the active property (or the "All properties" roll-up) from scope. */
export function useActiveProperty() {
  const activePropertyId = useAppSelector((s) => s.scope.activePropertyId);
  const properties = useAppSelector((s) => s.tenant.context?.properties ?? []);
  const isAll = !activePropertyId || activePropertyId === ALL_PROPERTIES;
  const active = isAll ? null : (properties.find((p) => p.id === activePropertyId) ?? null);
  return { activePropertyId, active, properties, isAll };
}
