import { z } from "zod";

/**
 * Triggers domain contracts (app-local, Zod-first). `TriggerDefinition` is the
 * fuller store shape behind the Session 3 `TriggerCatalogItem`
 * (`{key,label,description}`) — the `EventSelector` keeps consuming that
 * projection; do not duplicate the catalog. Property-scoped.
 */

export const TriggerCategory = z.enum(["gameplay", "lifecycle", "financial", "schedule"]);
export type TriggerCategory = z.infer<typeof TriggerCategory>;

export const TriggerStatus = z.enum(["active", "draft"]);
export type TriggerStatus = z.infer<typeof TriggerStatus>;

export const PayloadFieldType = z.enum(["string", "number", "boolean", "enum"]);
export type PayloadFieldType = z.infer<typeof PayloadFieldType>;

export const PayloadField = z.object({
  name: z.string(),
  type: PayloadFieldType,
  label: z.string(),
});
export type PayloadField = z.infer<typeof PayloadField>;

export const TriggerDefinition = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  description: z.string(),
  category: TriggerCategory,
  payloadFields: z.array(PayloadField),
  status: TriggerStatus,
  boundRuleCount: z.number().int(),
  propertyIds: z.array(z.string()),
  updatedAt: z.string(),
});
export type TriggerDefinition = z.infer<typeof TriggerDefinition>;

export const TriggerStatusCounts = z.object({
  all: z.number(),
  active: z.number(),
  draft: z.number(),
});
export type TriggerStatusCounts = z.infer<typeof TriggerStatusCounts>;

export const TriggerListStats = z.object({
  boundRules: z.number(),
  firedToday: z.number(),
});
export type TriggerListStats = z.infer<typeof TriggerListStats>;

export const TriggerListResponse = z.object({
  rows: z.array(TriggerDefinition),
  total: z.number(),
  counts: TriggerStatusCounts,
  stats: TriggerListStats,
});
export type TriggerListResponse = z.infer<typeof TriggerListResponse>;

/** A rule bound to a trigger (subset of the rules store shape). */
export const BoundRule = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
});
export type BoundRule = z.infer<typeof BoundRule>;
export const BoundRuleList = z.array(BoundRule);

// ── Form ──────────────────────────────────────────────────────────────────────

export const TriggerFormValues = z.object({
  label: z.string().min(1, "Name your trigger"),
  key: z
    .string()
    .min(2, "Add a key")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only"),
  category: TriggerCategory,
  description: z.string().min(1, "Add a description"),
  payloadFields: z.array(
    z.object({
      name: z.string().min(1, "Name required"),
      type: PayloadFieldType,
      label: z.string().min(1, "Label required"),
    }),
  ),
  propertyIds: z.array(z.string()).min(1, "Offer this trigger at a property"),
});
export type TriggerFormValues = z.infer<typeof TriggerFormValues>;

export const DEFAULT_TRIGGER_FORM: TriggerFormValues = {
  label: "",
  key: "",
  category: "gameplay",
  description: "",
  payloadFields: [{ name: "", type: "string", label: "" }],
  propertyIds: [],
};

export function toTriggerFormValues(t: TriggerDefinition): TriggerFormValues {
  return {
    label: t.label,
    key: t.key,
    category: t.category,
    description: t.description,
    payloadFields: t.payloadFields.length
      ? t.payloadFields
      : [{ name: "", type: "string", label: "" }],
    propertyIds: t.propertyIds,
  };
}

export function toTriggerBody(v: TriggerFormValues): Partial<TriggerDefinition> {
  return {
    label: v.label || "Untitled trigger",
    key: v.key,
    category: v.category,
    description: v.description,
    payloadFields: v.payloadFields.filter((f) => f.name),
    propertyIds: v.propertyIds,
  };
}
