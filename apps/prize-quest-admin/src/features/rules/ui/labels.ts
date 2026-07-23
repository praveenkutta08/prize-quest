import { compileClauses } from "@/shared/ui";
import { RULE_CONDITION_CATALOG } from "../model";
import type { ActionType, Rule, RuleAction } from "../model";

/** Short THEN-clause verb for the pseudocode block. */
export const ACTION_THEN: Record<ActionType, string> = {
  "send-offer": "send offer",
  "award-points": "award points",
  "notify-ops": "notify ops",
  "auto-enroll": "auto-enroll in campaign",
  "auto-pause": "notify ops + auto-pause",
};

export const ACTION_LABEL: Record<ActionType, string> = {
  "send-offer": "Send offer",
  "award-points": "Award points",
  "notify-ops": "Notify ops",
  "auto-enroll": "Auto-enroll",
  "auto-pause": "Notify ops + auto-pause",
};

/** Compact human action summary for the list/summary (e.g. "Send Comeback offer"). */
export function actionLabel(action: RuleAction): string {
  switch (action.type) {
    case "send-offer":
      return action.offerType ? `Send ${action.offerType}` : "Send offer";
    case "award-points":
      return action.points ? `Award ${action.points.toLocaleString()} pts` : "Award points";
    case "auto-enroll":
      return "Auto-enroll in campaign";
    default:
      return ACTION_LABEL[action.type];
  }
}

/** One-line condition pseudocode for the list "Condition" column. */
export function conditionSummary(rule: Rule): string {
  const clauses = compileClauses(rule.conditions, RULE_CONDITION_CATALOG);
  if (clauses.length === 0) return "Always";
  return clauses.join(` ${rule.conditions.conjunction} `);
}

/** "Jul 23 · 08:00" from an ISO time, or a fallback. */
export function runTime(iso: string | undefined, fallback = "—"): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return fallback;
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} · ${time}`;
}

/** "10:08:42" time-of-day for the log stream. */
export function timeOfDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString("en-US", { hour12: false });
}
