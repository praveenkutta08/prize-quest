import { z } from "zod";
import { ConditionGroup } from "@/shared/contracts";
import { ActionType, TriggerType, type Rule } from "./dto";

/**
 * The rule authoring form (plan §6.7). Looser than `Rule` (no id/status/runs),
 * with coerced numeric inputs and a `superRefine` that enforces the fields each
 * trigger type and action type actually require. `toRuleBody` maps to the API
 * payload; `toFormValues` seeds edit mode.
 */
export const RuleFormValues = z
  .object({
    name: z.string().min(1, "Name your rule"),
    description: z.string().max(280, "Keep it under 280 characters").optional(),
    triggerType: TriggerType,
    priority: z.coerce.number().int().min(1, "1–10").max(10, "1–10"),
    cron: z.string().optional(),
    eventKey: z.string().optional(),
    conditions: ConditionGroup,
    action: z.object({
      type: ActionType,
      offerType: z.string().optional(),
      channel: z.string().optional(),
      points: z.coerce.number().optional(),
      campaignId: z.string().optional(),
      recipients: z.array(z.string()).optional(),
    }),
  })
  .superRefine((v, ctx) => {
    if (v.triggerType === "scheduled" && !v.cron) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Set a schedule", path: ["cron"] });
    }
    if (v.triggerType === "event" && !v.eventKey) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pick an event", path: ["eventKey"] });
    }
    if (v.action.type === "send-offer" && !v.action.offerType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pick an offer type",
        path: ["action", "offerType"],
      });
    }
    if (v.action.type === "award-points" && !(Number(v.action.points) > 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a point amount",
        path: ["action", "points"],
      });
    }
    if (v.action.type === "auto-enroll" && !v.action.campaignId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pick a campaign",
        path: ["action", "campaignId"],
      });
    }
  });
export type RuleFormValues = z.infer<typeof RuleFormValues>;

export const DEFAULT_RULE_FORM: RuleFormValues = {
  name: "",
  description: "",
  triggerType: "scheduled",
  priority: 5,
  cron: "0 6 * * *",
  eventKey: undefined,
  conditions: { conjunction: "AND", conditions: [] },
  action: { type: "send-offer", offerType: "", channel: "" },
};

export function toRuleFormValues(rule: Rule): RuleFormValues {
  return {
    name: rule.name,
    description: rule.description ?? "",
    triggerType: rule.triggerType,
    priority: rule.priority,
    cron: rule.cron,
    eventKey: rule.eventKey,
    conditions: rule.conditions,
    action: {
      type: rule.action.type,
      offerType: rule.action.offerType,
      channel: rule.action.channel,
      points: rule.action.points,
      campaignId: rule.action.campaignId,
      recipients: rule.action.recipients,
    },
  };
}

export function toRuleBody(v: RuleFormValues): Partial<Rule> {
  return {
    name: v.name || "Untitled rule",
    description: v.description || undefined,
    triggerType: v.triggerType,
    priority: Number(v.priority) || 1,
    cron: v.triggerType === "scheduled" ? v.cron : undefined,
    eventKey: v.triggerType === "event" ? v.eventKey : undefined,
    conditions: v.conditions,
    action: {
      type: v.action.type,
      offerType: v.action.offerType || undefined,
      channel: v.action.channel || undefined,
      points: v.action.points ? Number(v.action.points) : undefined,
      campaignId: v.action.campaignId || undefined,
      recipients: v.action.recipients?.length ? v.action.recipients : undefined,
    },
  };
}
