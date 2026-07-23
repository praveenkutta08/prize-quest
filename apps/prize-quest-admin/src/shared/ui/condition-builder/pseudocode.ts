import { findField, type ConditionGroupValue, type FieldDef } from "./catalog";

/**
 * Turns an authored `ConditionGroup` into readable pseudocode clauses, e.g.
 *   tier IN [Gold, Platinum, Diamond]
 *   age ≥ 21
 * The `SummaryPanel` renders these under a `WHEN … AND … THEN …` frame. Both the
 * promotions eligibility flow and the Session 3 rule builder feed this compiler.
 */
export function compileClauses(
  group: ConditionGroupValue | undefined,
  catalog: FieldDef[],
): string[] {
  if (!group?.conditions?.length) return [];
  return group.conditions
    .map((c) => compileClause(c.field, c.operator, c.value, catalog))
    .filter((s): s is string => Boolean(s));
}

function compileClause(
  fieldKey: string,
  operatorKey: string,
  value: unknown,
  catalog: FieldDef[],
): string | null {
  const field = findField(catalog, fieldKey);
  if (!field) return null;
  const operator = field.operators.find((o) => o.key === operatorKey);
  const symbol = operator?.symbol ?? operatorKey;
  return `${field.token} ${symbol} ${formatValue(field, operatorKey, value)}`.trim();
}

function formatValue(field: FieldDef, operatorKey: string, value: unknown): string {
  if (Array.isArray(value)) {
    // A [min, max] tuple for `between`, otherwise a list of enum labels.
    if (operatorKey === "between") {
      const [min, max] = value;
      return `${labelOf(field, min)} AND ${labelOf(field, max)}`;
    }
    if (value.length === 0) return "[…]";
    return `[${value.map((v) => labelOf(field, v)).join(", ")}]`;
  }
  if (value === "" || value === undefined || value === null) return "…";
  const suffix = field.unit ? ` ${field.unit}` : "";
  return `${labelOf(field, value)}${suffix}`;
}

/** Prefer the option label for enum/keyword values; fall back to the raw value. */
function labelOf(field: FieldDef, value: unknown): string {
  const raw = String(value);
  const opt =
    field.options?.find((o) => o.value === raw) ?? field.keywords?.find((k) => k.value === raw);
  return opt?.label ?? raw;
}
