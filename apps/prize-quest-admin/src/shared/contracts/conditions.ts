import { z } from "zod";

/**
 * Condition-group contracts, shared across authoring surfaces. Promotions
 * eligibility (Session 2) and Rules Engine conditions (Session 3) both use these
 * — the generic `ConditionBuilder`/`SummaryPanel` in `shared/ui` operate on the
 * structural equivalents, and each feature supplies its own field catalog.
 */

export const Conjunction = z.enum(["AND", "OR"]);
export type Conjunction = z.infer<typeof Conjunction>;

export const ConditionOperator = z.enum(["in", "not-in", "eq", "gte", "lte", "between"]);
export type ConditionOperator = z.infer<typeof ConditionOperator>;

/**
 * A value editor emits one of: a keyword/string, a number, a list of enum
 * values, or a numeric [min, max] tuple. Kept as a permissive union so the
 * builder can drive any field type without a per-field schema.
 */
export const ConditionValue = z.union([
  z.string(),
  z.number(),
  z.array(z.string()),
  z.array(z.number()),
]);
export type ConditionValue = z.infer<typeof ConditionValue>;

export const Condition = z.object({
  field: z.string().min(1, "Pick a field"),
  operator: ConditionOperator,
  value: ConditionValue,
});
export type Condition = z.infer<typeof Condition>;

export const ConditionGroup = z.object({
  conjunction: Conjunction,
  conditions: z.array(Condition),
});
export type ConditionGroup = z.infer<typeof ConditionGroup>;
