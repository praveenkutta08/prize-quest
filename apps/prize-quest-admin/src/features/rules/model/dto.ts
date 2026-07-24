import { z } from "zod";
import { ConditionGroup, RuleStatus } from "@/shared/contracts";

/**
 * Rules Engine + Execution Logs contracts (app-local, Zod-first). `ConditionGroup`
 * is reused from `@/shared/contracts` (promoted there in Session 3 so promotions
 * and rules share it). Mirrors plan §7.2. One schema types the RTK Query
 * endpoints, validates MSW payloads, and drives the form resolver.
 */

export { RuleStatus };

export const TriggerType = z.enum(["scheduled", "event"]);
export type TriggerType = z.infer<typeof TriggerType>;

export const ActionType = z.enum([
  "send-offer",
  "award-points",
  "notify-ops",
  "auto-enroll",
  "auto-pause",
]);
export type ActionType = z.infer<typeof ActionType>;

/** Fields are conditional on `type` (see ActionConfig / the form resolver). */
export const RuleAction = z.object({
  type: ActionType,
  offerType: z.string().optional(),
  channel: z.string().optional(),
  points: z.number().optional(),
  campaignId: z.string().optional(),
  recipients: z.array(z.string()).optional(),
});
export type RuleAction = z.infer<typeof RuleAction>;

export const TriggerCatalogItem = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string(),
});
export type TriggerCatalogItem = z.infer<typeof TriggerCatalogItem>;
export const TriggerCatalogList = z.array(TriggerCatalogItem);

export const Rule = z.object({
  id: z.string(),
  name: z.string().min(1, "Name your rule"),
  description: z.string().optional(),
  triggerType: TriggerType,
  cron: z.string().optional(),
  eventKey: z.string().optional(),
  priority: z.number().int().min(1).max(10),
  conditions: ConditionGroup,
  action: RuleAction,
  status: RuleStatus,
  lastRun: z.string().optional(),
  nextRun: z.string().optional(),
  propertyIds: z.array(z.string()),
});
export type Rule = z.infer<typeof Rule>;

export const RuleStatusCounts = z.object({
  all: z.number(),
  active: z.number(),
  paused: z.number(),
  draft: z.number(),
});
export type RuleStatusCounts = z.infer<typeof RuleStatusCounts>;

export const RuleListStats = z.object({
  totalRules: z.number(),
  activeRules: z.number(),
  triggeredToday: z.number(),
  playersMatchedToday: z.number(),
});
export type RuleListStats = z.infer<typeof RuleListStats>;

export const RuleListResponse = z.object({
  rows: z.array(Rule),
  total: z.number(),
  counts: RuleStatusCounts,
  stats: RuleListStats,
});
export type RuleListResponse = z.infer<typeof RuleListResponse>;

export const RuleStatusPatch = z.object({ status: RuleStatus });
export type RuleStatusPatch = z.infer<typeof RuleStatusPatch>;

// ── Test runner ───────────────────────────────────────────────────────────────

export const TestRuleRequest = z.object({
  conditions: ConditionGroup,
  triggerType: TriggerType,
});
export type TestRuleRequest = z.infer<typeof TestRuleRequest>;

export const TestRuleResponse = z.object({ matchedPlayers: z.number() });
export type TestRuleResponse = z.infer<typeof TestRuleResponse>;

// ── Execution logs ────────────────────────────────────────────────────────────

export const Severity = z.enum(["ok", "warn", "err"]);
export type Severity = z.infer<typeof Severity>;

export const LogSource = z.enum(["scheduler", "event"]);
export type LogSource = z.infer<typeof LogSource>;

export const ExecutionLogEntry = z.object({
  id: z.string(),
  ruleId: z.string(),
  ruleName: z.string(),
  severity: Severity,
  time: z.string(),
  message: z.string(),
  matched: z.number(),
  sent: z.number(),
  runtimeMs: z.number(),
  source: LogSource,
  env: z.string(),
  propertyId: z.string(),
});
export type ExecutionLogEntry = z.infer<typeof ExecutionLogEntry>;

export const LogSeverityCounts = z.object({
  all: z.number(),
  ok: z.number(),
  warn: z.number(),
  err: z.number(),
});
export type LogSeverityCounts = z.infer<typeof LogSeverityCounts>;

export const LogListResponse = z.object({
  rows: z.array(ExecutionLogEntry),
  total: z.number(),
  counts: LogSeverityCounts,
  nextCursor: z.string().nullable(),
});
export type LogListResponse = z.infer<typeof LogListResponse>;
