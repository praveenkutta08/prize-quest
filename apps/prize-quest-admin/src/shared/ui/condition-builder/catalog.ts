/**
 * Generic, framework-agnostic contract for a typed condition field catalog.
 * `ConditionBuilder` (eligibility here, rule conditions in Session 3) and the
 * `SummaryPanel` pseudocode compiler are both driven entirely by an array of
 * `FieldDef` passed in as a prop — so the same components serve any domain.
 *
 * Structural (not Zod) types on purpose: a caller's Zod `ConditionGroup` is a
 * narrower shape that assigns cleanly to `ConditionGroupValue`.
 */

export type ValueEditor = "multi-select" | "number" | "number-range" | "keyword";

export interface FieldOption {
  value: string;
  label: string;
}

export interface OperatorDef {
  /** Operator key persisted on the condition (e.g. "in", "gte"). */
  key: string;
  /** Shown in the operator select (e.g. "in", "≥"). */
  label: string;
  /** Rendered in the pseudocode compiler (e.g. "IN", "≥", "BETWEEN"). */
  symbol: string;
}

export interface FieldDef {
  /** Persisted field key, e.g. "player.tier". */
  key: string;
  /** Shown in the field select, e.g. "player.tier". */
  label: string;
  /** Compact token used in pseudocode, e.g. "tier". */
  token: string;
  editor: ValueEditor;
  operators: OperatorDef[];
  /** Choices for `multi-select`. */
  options?: FieldOption[];
  /** Choices for `keyword`. */
  keywords?: FieldOption[];
  /** Optional unit suffix for number editors, e.g. "days". */
  unit?: string;
  placeholder?: string;
}

/** A single authored condition row. `value` shape depends on the field editor. */
export interface ConditionRowValue {
  field: string;
  operator: string;
  value: unknown;
}

export interface ConditionGroupValue {
  conjunction: "AND" | "OR";
  conditions: ConditionRowValue[];
}

/** Look up a field def by key. */
export function findField(catalog: FieldDef[], key: string): FieldDef | undefined {
  return catalog.find((f) => f.key === key);
}

/** A blank row seeded to the first field's first operator + an empty value. */
export function emptyRow(catalog: FieldDef[]): ConditionRowValue {
  const field = catalog[0];
  return {
    field: field?.key ?? "",
    operator: field?.operators[0]?.key ?? "",
    value: defaultValueFor(field),
  };
}

/** A sensible empty value for a field's editor. */
export function defaultValueFor(field: FieldDef | undefined): unknown {
  switch (field?.editor) {
    case "multi-select":
      return [] as string[];
    case "number":
      return "";
    case "number-range":
      return ["", ""] as string[];
    case "keyword":
      return field.keywords?.[0]?.value ?? "";
    default:
      return "";
  }
}
