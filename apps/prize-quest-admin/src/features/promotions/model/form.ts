import { z } from "zod";
import {
  CampaignType,
  ConditionGroup,
  CountsToward,
  EarnActivity,
  Schedule,
  type CampaignDefinition,
} from "./dto";

/**
 * The authoring form's values (plan §6.5). Looser than `CampaignDefinition` —
 * no id/status/metrics — with `z.coerce.number()` on the numeric text inputs so
 * the Zod resolver validates strings from the fields. `toCampaignBody` maps
 * these to the API payload; `toFormValues` seeds edit/duplicate mode.
 */
export const CampaignFormValues = z.object({
  name: z.string().min(1, "Name your campaign"),
  type: CampaignType,
  ownerId: z.string().min(1, "Pick an owner"),
  description: z.string().max(280, "Keep it under 280 characters").optional(),
  schedule: Schedule.extend({
    start: z.string().min(1, "Set a start date"),
    end: z.string().min(1, "Set an end date"),
  }),
  eligibility: ConditionGroup,
  earnRule: z.object({
    activity: EarnActivity,
    threshold: z.coerce.number().nonnegative("Must be zero or more"),
    currency: z.literal("USD"),
    countsToward: CountsToward,
    timeWindow: z.string().optional(),
  }),
  prizeIds: z.array(z.string()).min(1, "Add at least one prize"),
  compliance: z.object({
    budgetCap: z.coerce.number().nonnegative("Must be zero or more"),
    approverId: z.string().optional(),
    filingRef: z.string().optional(),
  }),
});
export type CampaignFormValues = z.infer<typeof CampaignFormValues>;

export const DEFAULT_FORM_VALUES: CampaignFormValues = {
  name: "",
  type: "goal-based",
  ownerId: "u-james-chen",
  description: "",
  schedule: { start: "", end: "", recurrence: "one-shot" },
  eligibility: { conjunction: "AND", conditions: [] },
  earnRule: { activity: "slot-wager", threshold: 0, currency: "USD", countsToward: "coin-in" },
  prizeIds: [],
  compliance: { budgetCap: 0, approverId: "u-maya-rodriguez", filingRef: "" },
};

/** Seed the form from an existing campaign (edit or duplicate). */
export function toFormValues(c: CampaignDefinition): CampaignFormValues {
  return {
    name: c.name,
    type: c.type,
    ownerId: c.ownerId,
    description: c.description ?? "",
    schedule: c.schedule,
    eligibility: c.eligibility,
    earnRule: {
      activity: c.earnRule.activity,
      threshold: c.earnRule.threshold,
      currency: c.earnRule.currency,
      countsToward: c.earnRule.countsToward,
      timeWindow: c.earnRule.timeWindow,
    },
    prizeIds: c.prizeIds,
    compliance: {
      budgetCap: c.compliance.budgetCap,
      approverId: c.compliance.approverId,
      filingRef: c.compliance.filingRef,
    },
  };
}

/** Map form values (possibly partial/mid-edit) to a campaign API payload. */
export function toCampaignBody(v: CampaignFormValues): Partial<CampaignDefinition> {
  return {
    name: v.name || "Untitled campaign",
    type: v.type,
    ownerId: v.ownerId,
    description: v.description || undefined,
    schedule: v.schedule,
    eligibility: v.eligibility,
    earnRule: {
      activity: v.earnRule.activity,
      threshold: Number(v.earnRule.threshold) || 0,
      currency: "USD",
      countsToward: v.earnRule.countsToward,
      timeWindow: v.earnRule.timeWindow || undefined,
    },
    prizeIds: v.prizeIds,
    compliance: {
      budgetCap: Number(v.compliance.budgetCap) || 0,
      budgetUsed: 0,
      approverId: v.compliance.approverId || undefined,
      filingRef: v.compliance.filingRef || undefined,
      jurisdiction: "NV",
    },
  };
}
